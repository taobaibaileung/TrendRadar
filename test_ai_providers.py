#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
测试AIProcessor对新增AI提供商的支持
"""

import json
from trendradar.ai.processor import AIProcessor

def test_ai_providers():
    """测试所有支持的AI提供商"""
    print("=== 测试AIProcessor新增提供商支持 ===")
    
    # 支持的AI提供商列表
    providers = [
        "mock",
        "gemini",
        "wenxin", 
        "tongyi",
        "deepseek",
        "alibailian",
        "doubao",
        "zhipu",
        "guijidonggan"
    ]
    
    sample_text = "这是一段关于人工智能技术发展的测试文本，用于测试AI处理器的功能。人工智能正在改变我们的生活和工作方式，从自动驾驶汽车到智能助手，从医疗诊断到金融分析，AI的应用无处不在。"
    
    for provider in providers:
        print(f"\n--- 测试 {provider} 提供商 ---")
        try:
            # 使用mock模式不需要API Key，其他模式由于只是模拟调用也不需要
            processor = AIProcessor(provider=provider, api_key="test-api-key" if provider != "mock" else None)
            print(f"✅ 成功初始化 {provider} 处理器")
            print(f"   模型名称: {processor.model_name}")
            
            # 测试分析功能
            result = processor.analyze_text(sample_text)
            if result:
                print(f"✅ {provider} 分析成功")
                print(f"   生成标题: {result.title}")
                print(f"   生成摘要: {result.summary[:100]}...")
                print(f"   生成标签: {result.tags}")
            else:
                print(f"❌ {provider} 分析失败")
                
        except Exception as e:
            print(f"❌ {provider} 测试失败: {e}")
    
    print("\n=== 测试完成 ===")

if __name__ == "__main__":
    test_ai_providers()
