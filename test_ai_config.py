#!/usr/bin/env python3
# coding=utf-8
"""
测试AI配置功能
验证配置读取逻辑是否能正确处理不同服务商的配置
"""

import os
import sys
from pathlib import Path

# 添加项目根目录到Python路径
sys.path.insert(0, str(Path(__file__).parent))

from trendradar.core.loader import load_config
from trendradar.ai.processor import AIProcessor


def test_ai_config_loading():
    """测试AI配置加载功能"""
    print("=== 测试AI配置加载功能 ===")
    
    # 加载配置
    try:
        config = load_config()
        print("✅ 配置文件加载成功")
        
        # 打印AI相关配置
        print(f"\nAI配置信息:")
        print(f"  AI_PROVIDER: {config.get('AI_PROVIDER')}")
        print(f"  AI_API_KEY: {'***' if config.get('AI_API_KEY') else '(未配置)'}")
        print(f"  AI_MODEL_NAME: {config.get('AI_MODEL_NAME')}")
        print(f"  AI_ENDPOINT_URL: {config.get('AI_ENDPOINT_URL')}")
        print(f"  AI_PROVIDER_CONFIG: {config.get('AI_PROVIDER_CONFIG')}")
        
        return config
        
    except Exception as e:
        print(f"❌ 配置文件加载失败: {e}")
        return None


def test_ai_processor_initialization(config):
    """测试AIProcessor初始化功能"""
    print("\n=== 测试AIProcessor初始化功能 ===")
    
    try:
        # 从配置中读取AI参数
        provider = config.get('AI_PROVIDER', 'mock')
        api_key = config.get('AI_API_KEY')
        model_name = config.get('AI_MODEL_NAME')
        endpoint_url = config.get('AI_ENDPOINT_URL')
        
        # 初始化AIProcessor
        ai_processor = AIProcessor(
            provider=provider,
            api_key=api_key,
            model_name=model_name,
            endpoint_url=endpoint_url
        )
        
        print(f"✅ 成功初始化AIProcessor")
        print(f"  Provider: {ai_processor.provider}")
        print(f"  Model Name: {ai_processor.model_name}")
        print(f"  Endpoint URL: {ai_processor.endpoint_url}")
        
        return ai_processor
        
    except Exception as e:
        print(f"❌ AIProcessor初始化失败: {e}")
        return None


def test_ai_processor_mock_analysis(ai_processor):
    """测试AIProcessor的分析功能（使用mock模式）"""
    print("\n=== 测试AIProcessor分析功能 ===")
    
    if ai_processor.provider != 'mock':
        print(f"⚠️ 当前使用的是{ai_processor.provider}，不是mock模式，跳过分析测试")
        return
    
    try:
        # 使用模拟文本进行分析
        sample_text = "这是一段关于下一代AI技术如何赋能开发者的长篇文章..."
        analysis_result = ai_processor.analyze_text(sample_text)
        
        if analysis_result:
            print("✅ 分析成功！")
            print(f"  标题: {analysis_result.title}")
            print(f"  摘要: {analysis_result.summary}")
            print(f"  分类: {analysis_result.category}")
            print(f"  标签: {analysis_result.tags}")
            print(f"  重要性: {analysis_result.importance}")
            print(f"  影响范围: {analysis_result.impact}")
            print(f"  核心要点: {analysis_result.key_points}")
        else:
            print("❌ 分析失败。")
            
    except Exception as e:
        print(f"❌ 分析功能测试失败: {e}")


def test_multiple_providers(config):
    """测试不同AI服务商的配置"""
    print("\n=== 测试不同AI服务商的配置 ===")
    
    # 测试的服务商列表
    test_providers = ['deepseek', 'alibailian', 'doubao', 'zhipu', 'guijidonggan']
    
    for provider in test_providers:
        print(f"\n测试服务商: {provider}")
        
        try:
            # 获取该服务商的特定配置
            provider_config = config.get('AI_PROVIDER_CONFIG', {})
            
            # 初始化AIProcessor
            ai_processor = AIProcessor(
                provider=provider,
                api_key=provider_config.get('api_key') or config.get('AI_API_KEY'),
                model_name=provider_config.get('model_name') or config.get('AI_MODEL_NAME'),
                endpoint_url=provider_config.get('endpoint_url') or config.get('AI_ENDPOINT_URL')
            )
            
            print(f"✅ 成功初始化{provider}的AIProcessor")
            print(f"  Model Name: {ai_processor.model_name}")
            print(f"  Endpoint URL: {ai_processor.endpoint_url}")
            
        except Exception as e:
            print(f"❌ 初始化{provider}的AIProcessor失败: {e}")


if __name__ == '__main__':
    """运行所有测试"""
    print("开始测试AI配置功能...\n")
    
    # 测试配置加载
    config = test_ai_config_loading()
    
    if config:
        # 测试AIProcessor初始化
        ai_processor = test_ai_processor_initialization(config)
        
        if ai_processor:
            # 测试分析功能
            test_ai_processor_mock_analysis(ai_processor)
            
        # 测试不同服务商
        test_multiple_providers(config)
    
    print("\n=== 所有测试完成 ===")
