# coding=utf-8
"""
AI 驱动的分析与聚合模块

取代原有的词频分析，使用大语言模型进行内容分析、分类和主题聚合。
"""

import json
from typing import List, Dict
from collections import defaultdict

from trendradar.storage.local import LocalStorageBackend
from trendradar.ai.processor import AIProcessor, AIAnalysisResult

def run_ai_analysis(storage: LocalStorageBackend, ai_processor: AIProcessor, date: str):
    """
    执行 AI 分析和聚合流程

    1. 从数据库读取所有待分析的文章（全文内容）。
    2. 对每篇文章进行独立的 AI 分析（提取摘要、标签等）。
    3. 根据分析结果（如共享标签）对文章进行分组。
    4. 对每个分组进行更高层级的 AI 主题分析（生成聚合标题、摘要等）。
    5. 将所有分析结果存回数据库。

    Args:
        storage: 本地存储后端实例
        ai_processor: AI 处理器实例
        date: 要处理的日期 (YYYY-MM-DD)
    """
    print("[AI Analyzer] 开始执行 AI 分析流程...")

    # 1. 读取待分析的文章
    articles_to_analyze = _get_articles_for_analysis(storage, date)
    if not articles_to_analyze:
        print("[AI Analyzer] 没有找到需要分析的新文章。")
        return

    print(f"[AI Analyzer] 找到 {len(articles_to_analyze)} 篇文章待分析。")

    # 2. 对每篇文章进行独立分析
    individual_results: Dict[int, AIAnalysisResult] = {}
    for article_id, content in articles_to_analyze.items():
        if not content or len(content) < 100: # 内容过短，跳过
            continue
        
        print(f"[AI Analyzer] 正在分析文章 ID: {article_id}...")
        analysis_result = ai_processor.analyze_text(content)
        if analysis_result:
            individual_results[article_id] = analysis_result

    if not individual_results:
        print("[AI Analyzer] 所有文章都未能成功进行初步分析。")
        return
        
    print(f"[AI Analyzer] {len(individual_results)} 篇文章初步分析完成。")

    # 3. 根据标签对文章进行分组
    # 使用 defaultdict(list) 可以简化代码
    tag_to_articles: Dict[str, List[int]] = defaultdict(list)
    for article_id, result in individual_results.items():
        for tag in result.tags:
            # 将标签标准化为小写，以便更好地分组
            tag_to_articles[tag.lower()].append(article_id)
            
    print(f"[AI Analyzer] 根据 {len(tag_to_articles)} 个独立标签对文章进行分组。")

    # 4. 对每个分组进行主题分析 (此处为简化版逻辑，实际可能更复杂)
    # 简化逻辑：此处我们仅将分析结果存入数据库，主题聚合将在下一步完成。
    # 更完整的逻辑会在这里进行二次AI调用。
    
    # 5. 将分析结果存入数据库
    _save_analysis_results(storage, individual_results, date, ai_processor)

    print("[AI Analyzer] 分析流程已完成。")


def _get_articles_for_analysis(storage: LocalStorageBackend, date: str) -> Dict[int, str]:
    """
    从数据库获取需要分析的文章（ID 和全文内容）
    
    逻辑：查找在 rss_items 中存在，但在 article_contents 中有内容，
          且尚未关联到任何 theme (theme_id is NULL) 的文章。
          
    Returns:
        一个字典 {rss_item_id: content}
    """
    try:
        conn = storage._get_connection(date, db_type="rss")
        cursor = conn.cursor()

        # SQL 查询：连接 rss_items 和 article_contents
        # 选择那些 theme_id 为空且 content 不为空的文章
        cursor.execute("""
            SELECT
                i.id,
                ac.content
            FROM rss_items AS i
            JOIN article_contents AS ac ON i.id = ac.rss_item_id
            WHERE i.theme_id IS NULL AND ac.content IS NOT NULL AND LENGTH(ac.content) > 50
        """)
        
        rows = cursor.fetchall()
        return {row['id']: row['content'] for row in rows}
        
    except Exception as e:
        print(f"[AI Analyzer] 从数据库获取待分析文章失败: {e}")
        return {}

def _save_analysis_results(storage: LocalStorageBackend, results: Dict[int, AIAnalysisResult], date: str, ai_processor: AIProcessor):
    """
    将分析结果保存到 analysis_themes 表，并更新 rss_items 的 theme_id
    
    Args:
        storage: 本地存储后端实例
        results: 文章ID到分析结果的映射
        date: 处理的日期
        ai_processor: AI处理器实例，用于二次聚合
    """
    try:
        conn = storage._get_connection(date, db_type="rss")
        cursor = conn.cursor()

        print(f"[AI Analyzer] 开始保存 {len(results)} 个分析结果...")

        cursor.execute("PRAGMA table_info(analysis_themes)")
        theme_columns = {row["name"] for row in cursor.fetchall()}
        has_tags_column = "tags" in theme_columns
        if not has_tags_column:
            try:
                cursor.execute("ALTER TABLE analysis_themes ADD COLUMN tags TEXT")
                conn.commit()
                has_tags_column = True
            except Exception as e:
                print(f"[AI Analyzer] 添加 tags 字段失败，将跳过标签保存: {e}")
        
        # 1. 构建标签到文章的映射
        tag_to_articles: Dict[str, List[int]] = defaultdict(list)
        for article_id, result in results.items():
            for tag in result.tags:
                # 将标签标准化为小写，以便更好地分组
                tag_to_articles[tag.lower()].append(article_id)
        
        # 2. 构建文章到标签的映射（用于后续聚合）
        article_to_tags: Dict[int, List[str]] = {}
        for article_id, result in results.items():
            article_to_tags[article_id] = [tag.lower() for tag in result.tags]
        
        # 3. 构建主题分组：找出共享标签最多的文章组合
        # 这里使用简单的规则：如果两篇文章共享至少一个标签，则它们属于同一主题
        # 实际应用中可以使用更复杂的算法（如聚类）
        theme_groups: List[Set[int]] = []
        for article_id, tags in article_to_tags.items():
            # 查找包含该文章任何标签的已有主题
            matched_groups = []
            for i, group in enumerate(theme_groups):
                # 检查是否有任何文章与当前文章共享标签
                for group_article_id in group:
                    if any(tag in article_to_tags[group_article_id] for tag in tags):
                        matched_groups.append(i)
                        break
            
            if not matched_groups:
                # 创建新主题
                theme_groups.append({article_id})
            else:
                # 合并所有匹配的主题
                new_group = {article_id}
                for idx in matched_groups:
                    new_group.update(theme_groups[idx])
                
                # 移除旧主题并添加新合并的主题
                for idx in sorted(matched_groups, reverse=True):
                    del theme_groups[idx]
                theme_groups.append(new_group)
        
        print(f"[AI Analyzer] 将 {len(results)} 篇文章聚合到 {len(theme_groups)} 个主题中。")
        
        # 4. 为每个主题创建聚合分析结果
        for i, group in enumerate(theme_groups):
            if not group:
                continue
            
            # 从组内文章中选择一篇作为主题代表（通常是第一篇）
            representative_article_id = next(iter(group))
            representative_analysis = results[representative_article_id]
            
            # 创建聚合的主题标题（如果有多个相同的标题，使用该标题；否则使用代表文章的标题）
            group_titles = [results[article_id].title for article_id in group]
            common_title = None
            if len(set(group_titles)) == 1:
                common_title = group_titles[0]
            else:
                # 如果没有共同标题，使用代表文章的标题加上聚合标记
                common_title = f"{representative_analysis.title} (聚合)"
            
            # 创建聚合摘要
            group_summaries = [results[article_id].summary for article_id in group]
            aggregated_summary = ""
            if len(group) > 1:
                print(f"[AI Analyzer] 主题 {i+1} 包含 {len(group)} 篇文章，正在进行二次摘要聚合...")
                aggregated_summary = ai_processor.aggregate_summaries(group_summaries)
            else:
                aggregated_summary = group_summaries[0]
            
            # 创建聚合关键点
            all_key_points = []
            all_tags = []
            for article_id in group:
                all_key_points.extend(results[article_id].key_points)
                all_tags.extend(results[article_id].tags)
            # 去重关键点
            seen_points = set()
            unique_key_points = []
            for point in all_key_points:
                if point not in seen_points:
                    seen_points.add(point)
                    unique_key_points.append(point)

            # 统计标签频率（聚合后用于主题标签展示）
            tag_counts: Dict[str, int] = {}
            for tag in all_tags:
                tag_key = tag.strip()
                if not tag_key:
                    continue
                tag_counts[tag_key] = tag_counts.get(tag_key, 0) + 1
            aggregated_tags = [
                tag for tag, _ in sorted(tag_counts.items(), key=lambda kv: (-kv[1], kv[0]))
            ][:5]
            
            # 使用代表文章的类别、重要性和影响
            category = representative_analysis.category
            importance = representative_analysis.importance
            impact = representative_analysis.impact
            
            # 保存聚合后的主题
            if has_tags_column:
                cursor.execute("""
                    INSERT INTO analysis_themes 
                    (title, summary, key_points, category, importance, impact, tags)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (
                    common_title,
                    aggregated_summary,
                    json.dumps(unique_key_points, ensure_ascii=False),
                    category,
                    importance,
                    impact,
                    json.dumps(aggregated_tags, ensure_ascii=False),
                ))
            else:
                cursor.execute("""
                    INSERT INTO analysis_themes 
                    (title, summary, key_points, category, importance, impact)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, (
                    common_title,
                    aggregated_summary,
                    json.dumps(unique_key_points, ensure_ascii=False),
                    category,
                    importance,
                    impact
                ))
            
            # 获取新创建的 theme ID
            theme_id = cursor.lastrowid
            
            # 将组内所有文章关联到这个主题
            for article_id in group:
                cursor.execute("""
                    UPDATE rss_items 
                    SET theme_id = ? 
                    WHERE id = ?
                """, (theme_id, article_id))
        
        # 5. 提交事务
        conn.commit()
        print(f"[AI Analyzer] 成功保存 {len(theme_groups)} 个聚合主题。")
        
    except Exception as e:
        print(f"[AI Analyzer] 保存分析结果失败: {e}")
        if 'conn' in locals():
            conn.rollback()
    finally:
        if 'conn' in locals():
            conn.close()
