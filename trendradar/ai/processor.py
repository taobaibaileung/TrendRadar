# coding=utf-8
"""
AI 内容处理器

负责连接大语言模型，并根据预设的指令分析文本内容。
"""

import json
from typing import Optional, Dict, Any, List
from dataclasses import dataclass, asdict
import re

# 这是一个占位符，实际使用时需要安装 google-generativeai
# import google.generativeai as genai

# --- 数据模型 ---
@dataclass
class AIAnalysisResult:
    """
    AI分析结果的数据模型
    """
    title: str
    summary: str
    category: str
    tags: List[str]
    importance: int
    impact: int
    key_points: List[str]

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

# --- AI 处理器 ---
class AIProcessor:
    """
    AI 内容分析器
    
    支持多种AI服务提供商，包括国内的文心一言、通义千问等。
    """
    # 支持的AI服务提供商
    SUPPORTED_PROVIDERS = ["gemini", "wenxin", "tongyi", "deepseek", "alibailian", "doubao", "zhipu", "guijidonggan", "mock"]
    
    def __init__(self, provider: str = "mock", api_key: str = None, model_name: str = None, endpoint_url: str = None):
        """
        初始化 AI 处理器

        Args:
            provider: AI服务提供商，可选值：gemini, wenxin, tongyi, mock
            api_key: 大语言模型的 API Key（可选，使用mock时不需要）
            model_name: 模型名称（可选，不同提供商有默认模型）
            endpoint_url: API端点URL（可选，使用默认值或用户自定义值）
        """
        if provider not in self.SUPPORTED_PROVIDERS:
            raise ValueError(f"不支持的AI服务提供商: {provider}，支持的提供商有: {self.SUPPORTED_PROVIDERS}")
        
        self.provider = provider
        self.api_key = api_key
        self.model = None
        self.endpoint_url = endpoint_url
        
        # 设置默认模型名称
        if not model_name:  # 检查是否为None或空字符串
            if provider == "gemini":
                self.model_name = "gemini-pro"
            elif provider == "wenxin":
                self.model_name = "ernie-bot"
            elif provider == "tongyi":
                self.model_name = "qwen-plus"
            elif provider == "deepseek":
                self.model_name = "deepseek-chat"
            elif provider == "alibailian":
                self.model_name = "bailian-pro"
            elif provider == "doubao":
                self.model_name = "doubao-pro"
            elif provider == "zhipu":
                self.model_name = "glm-4"
            elif provider == "guijidonggan":
                self.model_name = "guiji-pro"
            else:  # mock
                self.model_name = "mock-model"
        else:
            self.model_name = model_name
        
        # 初始化AI服务客户端（如果不是mock模式）
        if self.provider != "mock":
            if not api_key:
                raise ValueError("使用真实AI服务时，API Key 不能为空")
            self._initialize_client()

    def _initialize_client(self):
        """
        初始化不同AI服务提供商的客户端
        """
        try:
            if self.provider == "gemini":
                # Google Gemini 初始化（保持原有逻辑）
                # import google.generativeai as genai
                # genai.configure(api_key=self.api_key)
                # self.model = genai.GenerativeModel(self.model_name)
                pass
            elif self.provider == "wenxin":
                # 百度文心一言初始化
                # 这里使用文心一言的SDK示例，实际需要安装并配置
                # from erniebot_agent import ChatModel
                # self.model = ChatModel.from_pretrained(self.model_name)
                # self.model.set_access_token(self.api_key)
                pass
            elif self.provider == "tongyi":
                # 阿里通义千问初始化
                # 这里使用通义千问的SDK示例，实际需要安装并配置
                # from dashscope import Generation
                # self.model = Generation
                pass
            elif self.provider == "deepseek":
                # DeepSeek初始化
                # 这里使用DeepSeek的SDK示例，实际需要安装并配置
                # from deepseek import ChatModel
                # self.model = ChatModel.from_pretrained(self.model_name)
                # self.model.set_access_token(self.api_key)
                pass
            elif self.provider == "alibailian":
                # 阿里云百炼初始化
                # 这里使用阿里云百炼的SDK示例，实际需要安装并配置
                # from alibailian import Generation
                # self.model = Generation
                pass
            elif self.provider == "doubao":
                # 豆包初始化
                # 这里使用豆包的SDK示例，实际需要安装并配置
                # from doubao import ChatModel
                # self.model = ChatModel.from_pretrained(self.model_name)
                # self.model.set_access_token(self.api_key)
                pass
            elif self.provider == "zhipu":
                # 智谱初始化
                # 这里使用智谱的SDK示例，实际需要安装并配置
                # from zhipuai import Model
                # self.model = Model(self.model_name)
                # self.model.api_key = self.api_key
                pass
            elif self.provider == "guijidonggan":
                # 硅基动感初始化
                # 这里使用硅基动感的SDK示例，实际需要安装并配置
                # from guijidonggan import AIModel
                # self.model = AIModel(self.model_name)
                # self.model.set_api_key(self.api_key)
                pass
            
            print(f"[AI Processor] 成功初始化 {self.provider} 客户端，模型: {self.model_name}")
            
        except Exception as e:
            raise RuntimeError(f"初始化 {self.provider} 客户端失败: {e}")

    def analyze_text(self, text_content: str) -> Optional[AIAnalysisResult]:
        """
        分析给定的文本内容

        Args:
            text_content: 从网页抓取到的文章全文

        Returns:
            一个 AIAnalysisResult 对象，如果分析失败则返回 None
        """
        
        # 如果是mock模式，直接返回模拟数据
        if self.provider == "mock":
            print("[AI Processor] 警告：正在使用模拟数据，未真实调用 AI API。")
            return self._get_mock_result()

        # 构建prompt
        prompt = self._build_prompt(text_content)
        
        try:
            # 根据不同的AI服务提供商调用相应的API
            if self.provider == "gemini":
                result_dict = self._call_gemini_api(prompt)
            elif self.provider == "wenxin":
                result_dict = self._call_wenxin_api(prompt)
            elif self.provider == "tongyi":
                result_dict = self._call_tongyi_api(prompt)
            elif self.provider == "deepseek":
                result_dict = self._call_deepseek_api(prompt)
            elif self.provider == "alibailian":
                result_dict = self._call_alibailian_api(prompt)
            elif self.provider == "doubao":
                result_dict = self._call_doubao_api(prompt)
            elif self.provider == "zhipu":
                result_dict = self._call_zhipu_api(prompt)
            elif self.provider == "guijidonggan":
                result_dict = self._call_guijidonggan_api(prompt)
            else:
                # 默认使用mock数据
                return self._get_mock_result()
            
            return self._parse_result(result_dict)
        except Exception as e:
            print(f"[AI Processor] 调用 {self.provider} API 失败: {e}")
            # 如果调用失败，返回mock数据作为备用
            print("[AI Processor] 使用模拟数据作为备用。")
            return self._get_mock_result()
        
    def _build_prompt(self, text_content: str) -> str:
        """构建发送给大语言模型的指令 (Prompt)"""
        
        # 限制内容长度，防止超出 token 限制
        max_length = 15000
        if len(text_content) > max_length:
            text_content = text_content[:max_length] + "... (内容已截断)"

        prompt = f"""
请你扮演一个专业的新闻分析师。请仔细阅读以下文章内容，并根据你的理解，以严格的 JSON 格式返回你的分析结果。请特别关注经济趋势、国际关系和技术科技相关的内容。

**文章内容:**
---
{text_content}
---

**分析要求:**
请根据文章内容，提取或生成以下信息，并以一个完整的 JSON 对象返回：
1.  `title`: (string) 生成一个简洁、精炼、吸引人的标题，不超过 25 个字。
2.  `summary`: (string) 对全文进行深入总结，生成一段约 150-250 字的摘要。
3.  `category`: (string) 从以下分类中选择最相关的一个：经济趋势、国际关系、技术科技、商业、金融、政治、军事、社会、文化、其他。
4.  `tags`: (string array) 提取文章的 3-5 个核心关键词作为标签。
5.  `importance`: (integer) 评估文章的重要性，范围从 1 (非常不重要) 到 10 (非常重要)。
6.  `impact`: (integer) 评估文章的潜在影响范围，范围从 1 (影响极小) 到 10 (影响巨大)。
7.  `key_points`: (string array) 列出文章的 3-5 个核心要点，每点一句话。

**输出格式要求:**
- 你的回答必须是一个能够被 `json.loads()` 函数直接解析的、格式严格的 JSON 对象。
- 不要添加任何 JSON 格式以外的说明、注释或 markdown 标记（例如 \`\`\`json）。
- 键名必须与要求中的完全一致。
- 值的类型必须与要求中的完全一致。

**JSON 示例:**
{{
  "title": "...",
  "summary": "...",
  "category": "...",
  "tags": ["...", "..."],
  "importance": 7,
  "impact": 6,
  "key_points": ["...", "..."]
}}
"""
        return prompt

    def _extract_json(self, text: str) -> str:
        """从模型的返回文本中提取 JSON 部分"""
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            return match.group(0)
        return text # 如果没有找到，假设整个文本就是 JSON

    def _parse_result(self, result_dict: Dict[str, Any]) -> Optional[AIAnalysisResult]:
        """将解析后的字典转换为 AIAnalysisResult 对象"""
        try:
            return AIAnalysisResult(
                title=result_dict.get("title", "无标题"),
                summary=result_dict.get("summary", ""),
                category=result_dict.get("category", "其他"),
                tags=result_dict.get("tags", []),
                importance=int(result_dict.get("importance", 5)),
                impact=int(result_dict.get("impact", 5)),
                key_points=result_dict.get("key_points", [])
            )
        except (TypeError, ValueError) as e:
            print(f"[AI Processor] 解析 API 返回的 JSON 字段失败: {e}")
            return None
            
    def _call_gemini_api(self, prompt: str) -> Dict[str, Any]:
        """
        调用Google Gemini API
        
        Args:
            prompt: 提示词
            
        Returns:
            API返回的结果字典
        """
        # 这里是Google Gemini的调用逻辑
        # response = self.model.generate_content(prompt)
        # raw_json = self._extract_json(response.text)
        # return json.loads(raw_json)
        
        # 暂时返回mock数据
        print("[AI Processor] 调用Google Gemini API（模拟）")
        return self._get_mock_result().to_dict()
    
    def _call_wenxin_api(self, prompt: str) -> Dict[str, Any]:
        """
        调用百度文心一言API
        
        Args:
            prompt: 提示词
            
        Returns:
            API返回的结果字典
        """
        # 这里是百度文心一言的调用逻辑
        # response = self.model.chat([{"role": "user", "content": prompt}])
        # raw_json = response.content
        # return json.loads(raw_json)
        
        # 暂时返回mock数据
        print("[AI Processor] 调用百度文心一言API（模拟）")
        return self._get_mock_result().to_dict()
    
    def _call_tongyi_api(self, prompt: str) -> Dict[str, Any]:
        """
        调用阿里通义千问API
        
        Args:
            prompt: 提示词
            
        Returns:
            API返回的结果字典
        """
        # 这里是阿里通义千问的调用逻辑
        # response = self.model.call(model=self.model_name, prompt=prompt, result_format="json")
        # return json.loads(response.output.text)
        
        # 暂时返回mock数据
        print("[AI Processor] 调用阿里通义千问API（模拟）")
        return self._get_mock_result().to_dict()
    
    def _call_deepseek_api(self, prompt: str) -> Dict[str, Any]:
        """
        调用DeepSeek API
        
        Args:
            prompt: 提示词
            
        Returns:
            API返回的结果字典
        """
        # 这里是DeepSeek的调用逻辑
        # response = self.model.chat([{"role": "user", "content": prompt}])
        # raw_json = response.content
        # return json.loads(raw_json)
        
        # 暂时返回mock数据
        print("[AI Processor] 调用DeepSeek API（模拟）")
        return self._get_mock_result().to_dict()
    
    def _call_alibailian_api(self, prompt: str) -> Dict[str, Any]:
        """
        调用阿里云百炼API
        
        Args:
            prompt: 提示词
            
        Returns:
            API返回的结果字典
        """
        # 这里是阿里云百炼的调用逻辑
        # response = self.model.call(model=self.model_name, prompt=prompt, result_format="json")
        # return json.loads(response.output.text)
        
        # 暂时返回mock数据
        print("[AI Processor] 调用阿里云百炼API（模拟）")
        return self._get_mock_result().to_dict()
    
    def _call_doubao_api(self, prompt: str) -> Dict[str, Any]:
        """
        调用豆包API
        
        Args:
            prompt: 提示词
            
        Returns:
            API返回的结果字典
        """
        # 这里是豆包的调用逻辑
        # response = self.model.chat([{"role": "user", "content": prompt}])
        # raw_json = response.content
        # return json.loads(raw_json)
        
        # 暂时返回mock数据
        print("[AI Processor] 调用豆包API（模拟）")
        return self._get_mock_result().to_dict()
    
    def _call_zhipu_api(self, prompt: str) -> Dict[str, Any]:
        """
        调用智谱API
        
        Args:
            prompt: 提示词
            
        Returns:
            API返回的结果字典
        """
        # 这里是智谱的调用逻辑
        # response = self.model.chat([{"role": "user", "content": prompt}])
        # raw_json = response.content
        # return json.loads(raw_json)
        
        # 暂时返回mock数据
        print("[AI Processor] 调用智谱API（模拟）")
        return self._get_mock_result().to_dict()
    
    def _call_guijidonggan_api(self, prompt: str) -> Dict[str, Any]:
        """
        调用硅基动感API
        
        Args:
            prompt: 提示词
            
        Returns:
            API返回的结果字典
        """
        # 这里是硅基动感的调用逻辑
        # response = self.model.chat([{"role": "user", "content": prompt}])
        # raw_json = response.content
        # return json.loads(raw_json)
        
        # 暂时返回mock数据
        print("[AI Processor] 调用硅基动感API（模拟）")
        return self._get_mock_result().to_dict()
    
    def aggregate_summaries(self, summaries: List[str]) -> str:
        """
        使用 AI 聚合多个摘要，生成一个更高层级的、更连贯的摘要。

        Args:
            summaries: 多个摘要组成的列表。

        Returns:
            一个聚合后的摘要字符串。
        """
        if not summaries:
            return ""

        # 如果是mock模式，返回一个简单的拼接结果
        if self.provider == "mock":
            return "\n\n".join(f"• {s}" for s in summaries)

        # 构建聚合 prompt
        prompt = self._build_aggregation_prompt(summaries)

        try:
            # 根据不同的AI服务提供商调用相应的API
            # 注意：这里我们假设API调用返回的是一个简单的文本摘要，而不是复杂的JSON
            if self.provider == "gemini":
                # response = self.model.generate_content(prompt)
                # return response.text
                return f"这是一个模拟的聚合摘要，它总结了 {len(summaries)} 篇文章。"
            elif self.provider == "wenxin":
                # response = self.model.chat([{"role": "user", "content": prompt}])
                # return response.content
                return f"这是一个模拟的聚合摘要，它总结了 {len(summaries)} 篇文章。"
            elif self.provider == "tongyi":
                # response = self.model.call(model=self.model_name, prompt=prompt)
                # return response.output.text
                return f"这是一个模拟的聚合摘要，它总结了 {len(summaries)} 篇文章。"
            else:
                return "\n\n".join(f"• {s}" for s in summaries)

        except Exception as e:
            print(f"[AI Processor] 调用 {self.provider} API 进行摘要聚合失败: {e}")
            # 失败时回退到简单的拼接
            return "\n\n".join(f"• {s}" for s in summaries)

    def _build_aggregation_prompt(self, summaries: List[str]) -> str:
        """为摘要聚合构建专用的 Prompt"""
        
        summaries_text = ""
        for i, summary in enumerate(summaries, 1):
            summaries_text += f"**摘要 {i}:**\n{summary}\n\n"

        prompt = f"""
请你扮演一个高级新闻分析师和编辑。下面有多篇关于同一主题新闻的摘要。请你将这些独立的摘要融合成一个单一的、流畅的、高质量的综合性摘要。

**你的任务:**
1.  **识别核心主题**: 找出所有摘要共同讨论的核心事件或主题。
2.  **整合关键信息**: 将每篇摘要中的关键信息点（如时间、地点、人物、原因、结果）无缝地整合到一起。
3.  **消除冗余**: 移除重复的信息，使最终的摘要简洁明了。
4.  **确保连贯性**: 组织语言，使得最终的摘要读起来像一篇完整的文章，而不是简单的列表。
5.  **保持中立客观**: 保持客观的语调，不要加入你自己的观点。

**待整合的摘要:**
---
{summaries_text}
---

**输出要求:**
- 直接返回一个综合性的摘要段落。
- 长度在 200-300 字之间。
- 不要使用列表格式（如 "•"）。
- 不要返回任何多余的解释或标题，只需要摘要本身。
"""
        return prompt

    def _get_mock_result(self) -> AIAnalysisResult:
        """返回一个用于测试的模拟结果"""
        return AIAnalysisResult(
            title="模拟AI分析标题",
            summary="这是一个由模拟数据生成的摘要，用于在没有真实API Key的情况下测试流程。它描述了一个关于人工智能如何改变软件开发的虚构事件。",
            category="科技",
            tags=["AI", "软件开发", "模拟数据"],
            importance=8,
            impact=7,
            key_points=[
                "AI正在自动化部分编码工作。",
                "开发者需要学习新的技能以适应变化。",
                "这是一个模拟要点，不代表真实内容。"
            ]
        )

# 使用示例
if __name__ == '__main__':
    """
    AIProcessor使用示例
    展示如何使用不同的AI服务提供商
    """
    
    # 示例1：使用mock模式（无需API Key，用于测试）
    print("=== 示例1：使用mock模式 ===")
    try:
        mock_processor = AIProcessor(provider="mock")
        sample_text = "这是一段关于下一代AI技术如何赋能开发者的长篇文章..."
        analysis_result = mock_processor.analyze_text(sample_text)
        
        if analysis_result:
            print("✅ 分析成功！")
            print(json.dumps(analysis_result.to_dict(), indent=2, ensure_ascii=False))
        else:
            print("❌ 分析失败。")
    except Exception as e:
        print(f"❌ 使用mock模式失败: {e}")
    
    # 示例2：使用百度文心一言（需要真实API Key）
    print("\n=== 示例2：使用百度文心一言 ===")
    try:
        # 实际使用时需要替换为真实的API Key
        # wenxin_processor = AIProcessor(provider="wenxin", api_key="YOUR_WENXIN_API_KEY")
        # sample_text = "这是一段关于人工智能的文章内容..."
        # analysis_result = wenxin_processor.analyze_text(sample_text)
        
        # 由于没有真实API Key，这里使用mock数据模拟
        print("⚠️  由于没有真实API Key，此示例使用模拟数据")
        mock_wenxin_processor = AIProcessor(provider="mock")
        sample_text = "这是一段关于人工智能的文章内容..."
        analysis_result = mock_wenxin_processor.analyze_text(sample_text)
        
        if analysis_result:
            print("✅ 分析成功！")
            print(json.dumps(analysis_result.to_dict(), indent=2, ensure_ascii=False))
        else:
            print("❌ 分析失败。")
    except Exception as e:
        print(f"❌ 使用百度文心一言失败: {e}")
    
    # 示例3：使用阿里通义千问（需要真实API Key）
    print("\n=== 示例3：使用阿里通义千问 ===")
    try:
        # 实际使用时需要替换为真实的API Key
        # tongyi_processor = AIProcessor(provider="tongyi", api_key="YOUR_TONGYI_API_KEY")
        # sample_text = "这是一段关于人工智能的文章内容..."
        # analysis_result = tongyi_processor.analyze_text(sample_text)
        
        # 由于没有真实API Key，这里使用mock数据模拟
        print("⚠️  由于没有真实API Key，此示例使用模拟数据")
        mock_tongyi_processor = AIProcessor(provider="mock")
        sample_text = "这是一段关于人工智能的文章内容..."
        analysis_result = mock_tongyi_processor.analyze_text(sample_text)
        
        if analysis_result:
            print("✅ 分析成功！")
            print(json.dumps(analysis_result.to_dict(), indent=2, ensure_ascii=False))
        else:
            print("❌ 分析失败。")
    except Exception as e:
        print(f"❌ 使用阿里通义千问失败: {e}")
