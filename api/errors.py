# coding=utf-8
"""
错误追踪系统

轻量级错误记录和统计，用于监控数据源抓取、AI分析、存储等环节的失败情况。
"""

import os
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from threading import Lock

class ErrorTracker:
    """错误追踪器"""

    def __init__(self, max_errors: int = 1000, retention_days: int = 3):
        """
        初始化错误追踪器

        Args:
            max_errors: 最大保留错误条数
            retention_days: 错误保留天数
        """
        self.max_errors = max_errors
        self.retention_days = retention_days
        self.errors: List[Dict[str, Any]] = []
        self.source_failures: Dict[str, Dict[str, Any]] = {}
        self.lock = Lock()

        # 缓存的统计摘要（避免实时计算）
        self._cached_summary: Dict[str, Any] = {
            "total_unresolved": 0,
            "by_type": {},
            "by_severity": {},
            "recent_errors": []
        }

        # 持久化文件路径
        self.persistence_file = os.path.join(
            os.path.dirname(__file__),
            "..",
            "data",
            "error_logs.json"
        )

        # 周期错误追踪：记录每个周期内的错误，用于去重
        # 格式：{cycle_id: {source_name: True}}
        self.cycle_errors: Dict[str, set] = {}

        # 启动时加载持久化的错误
        self._load_from_disk()

    def log_error(
        self,
        error_type: str,
        source: str,
        message: str,
        severity: str = "error",
        details: Optional[str] = None,
        cycle_id: Optional[str] = None
    ):
        """
        记录错误

        Args:
            error_type: 错误类型 ('source', 'ai', 'storage', 'display')
            source: 错误来源 (如 "HackerNews", "OpenAI API")
            message: 错误消息
            severity: 严重程度 ('warning', 'error', 'critical')
            details: 详细信息
            cycle_id: 周期ID，用于去重同一个周期的重试错误
        """
        with self.lock:
            # 如果是数据源错误且提供了周期ID，检查是否在本周期内已记录
            if error_type == "source" and cycle_id:
                cycle_key = f"{cycle_id}_{source}"
                if cycle_key in self.cycle_errors.get(cycle_id, set()):
                    # 同一周期内同一数据源的重复错误，只记录但不计入失败统计
                    error = {
                        "id": f"{error_type}_{source}_{int(datetime.now().timestamp() * 1000)}",
                        "type": error_type,
                        "source": source,
                        "message": message,
                        "severity": severity,
                        "details": details,
                        "timestamp": datetime.now().isoformat(),
                        "resolved": False,
                        "cycle_id": cycle_id,
                        "is_duplicate": True  # 标记为重复错误
                    }
                    self.errors.append(error)
                    self._cleanup_old_errors()
                    self._save_to_disk()
                    self._update_summary_cache()
                    return
                else:
                    # 首次记录该周期该数据源的失败
                    if cycle_id not in self.cycle_errors:
                        self.cycle_errors[cycle_id] = set()
                    self.cycle_errors[cycle_id].add(source)

            error = {
                "id": f"{error_type}_{source}_{int(datetime.now().timestamp() * 1000)}",
                "type": error_type,
                "source": source,
                "message": message,
                "severity": severity,
                "details": details,
                "timestamp": datetime.now().isoformat(),
                "resolved": False
            }

            if cycle_id:
                error["cycle_id"] = cycle_id

            self.errors.append(error)

            # 清理旧错误
            self._cleanup_old_errors()

            # 持久化到磁盘
            self._save_to_disk()

            # 更新统计缓存
            self._update_summary_cache()

            # 如果是数据源错误且非重复，追踪失败情况
            if error_type == "source":
                # 检查是否为重复错误
                is_duplicate = error.get("is_duplicate", False)
                if not is_duplicate:
                    self._track_source_failure(source)

    def _track_source_failure(self, source_name: str):
        """追踪数据源失败情况"""
        if source_name not in self.source_failures:
            self.source_failures[source_name] = {
                "count": 0,
                "first_failure": datetime.now().isoformat(),
                "last_failure": None
            }

        self.source_failures[source_name]["count"] += 1
        self.source_failures[source_name]["last_failure"] = datetime.now().isoformat()

        # 检查是否需要禁用数据源
        if self._should_disable_source(source_name):
            # 返回建议禁用的信号
            return True

        return False

    def _should_disable_source(self, source_name: str) -> bool:
        """
        判断是否应该禁用数据源

        规则：3天内失败 >= 5次，就禁用数据源
        （这里的失败次数按周期计算，同一周期的重试不计入）
        """
        # 计算3天内该数据源的失败次数
        three_days_ago = datetime.now() - timedelta(days=3)

        # 筛选出该数据源在3天内的非重复错误
        recent_failures = [
            e for e in self.errors
            if (
                e["type"] == "source" and
                e["source"] == source_name and
                not e.get("is_duplicate", False) and
                datetime.fromisoformat(e["timestamp"]) >= three_days_ago
            )
        ]

        # 失败次数 >= 5
        return len(recent_failures) >= 5

    def get_errors(
        self,
        unresolved_only: bool = True,
        limit: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """
        获取错误列表

        Args:
            unresolved_only: 是否只返回未解决的错误
            limit: 返回数量限制

        Returns:
            错误列表，按时间倒序
        """
        with self.lock:
            errors = self.errors

            if unresolved_only:
                errors = [e for e in errors if not e["resolved"]]

            # 按时间倒序
            errors = sorted(errors, key=lambda x: x["timestamp"], reverse=True)

            if limit:
                errors = errors[:limit]

            return errors

    def get_summary(self) -> Dict[str, Any]:
        """
        获取错误统计摘要（返回缓存值）

        Returns:
            包含错误数量和统计的摘要
        """
        with self.lock:
            # 复制缓存并添加统计信息
            summary = self._cached_summary.copy()

            # 添加按数据源分组的统计（仅数据源类型的错误，只返回计数）
            summary["by_source"] = self._get_source_statistics_simple()

            # 添加按日期分组的统计
            summary["by_date"] = self._get_date_statistics()

            return summary

    def _get_source_statistics_simple(self) -> Dict[str, int]:
        """
        获取按数据源分组的统计信息（简化版，只返回计数）

        Returns:
            按数据源分组的失败次数，格式：
            {
                "source_name": 失败次数
            }
        """
        source_stats = {}

        # 筛选出数据源类型的未解决错误，且排除重复错误
        source_errors = [
            e for e in self.errors
            if e["type"] == "source" and not e["resolved"] and not e.get("is_duplicate", False)
        ]

        # 按数据源分组计数
        for error in source_errors:
            source = error["source"]
            if source not in source_stats:
                source_stats[source] = 0
            source_stats[source] += 1

        return source_stats

    def _get_date_statistics(self) -> Dict[str, int]:
        """
        获取按日期分组的统计信息

        Returns:
            按日期分组的失败次数，格式：
            {
                "2025-01-11": 10,
                "2025-01-10": 5
            }
        """
        date_stats = {}

        # 筛选出所有未解决的错误，且排除重复错误
        errors = [
            e for e in self.errors
            if not e["resolved"] and not e.get("is_duplicate", False)
        ]

        # 按日期分组计数
        for error in errors:
            try:
                timestamp = datetime.fromisoformat(error["timestamp"])
                date_str = timestamp.strftime("%Y-%m-%d")
                if date_str not in date_stats:
                    date_stats[date_str] = 0
                date_stats[date_str] += 1
            except:
                pass

        # 按日期倒序排序（最近日期在前）
        sorted_dates = dict(sorted(date_stats.items(), key=lambda x: x[0], reverse=True))
        return sorted_dates

    def clear_cycle_errors(self, cycle_id: str):
        """
        清理指定周期的错误追踪缓存

        Args:
            cycle_id: 周期ID
        """
        with self.lock:
            if cycle_id in self.cycle_errors:
                del self.cycle_errors[cycle_id]

    def _update_summary_cache(self):
        """
        更新统计缓存（在错误发生变化时调用）
        """
        unresolved = [e for e in self.errors if not e["resolved"]]

        # 按类型统计
        by_type = {}
        for error in unresolved:
            error_type = error["type"]
            if error_type not in by_type:
                by_type[error_type] = 0
            by_type[error_type] += 1

        # 按严重程度统计
        by_severity = {}
        for error in unresolved:
            severity = error["severity"]
            if severity not in by_severity:
                by_severity[severity] = 0
            by_severity[severity] += 1

        # 最近的5条未解决错误
        recent_errors = sorted(
            unresolved,
            key=lambda x: x["timestamp"],
            reverse=True
        )[:5]

        self._cached_summary = {
            "total_unresolved": len(unresolved),
            "by_type": by_type,
            "by_severity": by_severity,
            "recent_errors": recent_errors
        }

    def resolve_errors(self, error_type: Optional[str] = None, source: Optional[str] = None):
        """
        标记错误已解决

        Args:
            error_type: 错误类型（可选）
            source: 错误来源（可选）
        """
        with self.lock:
            for error in self.errors:
                if error["resolved"]:
                    continue

                if error_type and error["type"] != error_type:
                    continue

                if source and error["source"] != source:
                    continue

                error["resolved"] = True

            # 如果指定了来源，重置失败计数
            if source and error_type == "source":
                if source in self.source_failures:
                    self.source_failures[source]["count"] = 0

            self._save_to_disk()

            # 更新统计缓存
            self._update_summary_cache()

    def _cleanup_old_errors(self):
        """清理旧错误"""
        now = datetime.now()
        cutoff = now - timedelta(days=self.retention_days)

        # 移除超过保留期的已解决错误
        self.errors = [
            e for e in self.errors
            if not (
                e["resolved"] and
                datetime.fromisoformat(e["timestamp"]) < cutoff
            )
        ]

        # 如果超过最大数量，移除最旧的已解决错误
        unresolved = [e for e in self.errors if not e["resolved"]]
        resolved = [e for e in self.errors if e["resolved"]]

        if len(unresolved) > self.max_errors:
            self.errors = unresolved[:self.max_errors]
        else:
            available_slots = self.max_errors - len(unresolved)
            self.errors = unresolved + resolved[:available_slots]

    def _save_to_disk(self):
        """持久化错误到磁盘"""
        try:
            # 确保目录存在
            os.makedirs(os.path.dirname(self.persistence_file), exist_ok=True)

            data = {
                "errors": self.errors,
                "source_failures": self.source_failures
            }

            with open(self.persistence_file, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
        except Exception as e:
            # 持久化失败不影响主流程
            print(f"Error saving error logs: {e}")

    def _load_from_disk(self):
        """从磁盘加载错误"""
        try:
            if os.path.exists(self.persistence_file):
                with open(self.persistence_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.errors = data.get("errors", [])
                    self.source_failures = data.get("source_failures", {})

                # 启动时清理旧错误
                self._cleanup_old_errors()

                # 重建缓存
                self._update_summary_cache()
        except Exception as e:
            print(f"Error loading error logs: {e}")
            self.errors = []
            self.source_failures = {}


# 全局单例
_error_tracker: Optional[ErrorTracker] = None


def get_error_tracker() -> ErrorTracker:
    """获取错误追踪器单例"""
    global _error_tracker
    if _error_tracker is None:
        _error_tracker = ErrorTracker()
    return _error_tracker
