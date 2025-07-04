# agent.py

from flask import Flask, request, jsonify
from flask_cors import CORS

from google.adk.agents import Agent, LlmAgent
from google.adk.tools.tool_context import ToolContext
from google.adk.tools.base_tool import BaseTool
from google.adk.models.lite_llm import LiteLlm

from pydantic import BaseModel, Field
import yfinance as yf
from typing import Dict, Any, Optional

from dotenv import load_dotenv
import os

# ✅ Load environment variables
load_dotenv()

# ✅ Ensure Vertex is disabled (Studio API only)
os.environ["GOOGLE_GENAI_USE_VERTEXAI"] = "False"

GOOGLE_API_KEY = ""

# ✅ Create LiteLlm instance for ADK usage
llm = LiteLlm(
    model="gemini/gemini-1.5-pro-latest",
    api_key=GOOGLE_API_KEY,
    provider="gemini",
)

# ✅ Basic Agent
basic_agent = Agent(
    name="basic_agent",
    model=llm,
    description="A simple agent that answers questions",
    instruction="""
    You are a helpful stock market assistant. Be concise.
    If you don't know something, just say so.
    """,
)

# ✅ Tool Agent
def get_stock_price(ticker: str):
    stock = yf.Ticker(ticker)
    price = stock.info.get("currentPrice", "Price not available")
    return {"price": price, "ticker": ticker}

tool_agent = Agent(
    name="tool_agent",
    model=llm,
    description="A simple agent that gets stock prices",
    instruction="""
    You are a stock price assistant. Always use the get_stock_price tool.
    Include the ticker symbol in your response.
    """,
    tools=[get_stock_price],
)

# ✅ Stateful Agent
def get_stock_price_stateful(ticker: str, tool_context: ToolContext):
    stock = yf.Ticker(ticker)
    price = stock.info.get("currentPrice", "Price not available")

    if "recent_searches" not in tool_context.state:
        tool_context.state["recent_searches"] = []

    recent_searches = tool_context.state["recent_searches"]
    if ticker not in recent_searches:
        recent_searches.append(ticker)
        tool_context.state["recent_searches"] = recent_searches

    return {"price": price, "ticker": ticker}

stateful_agent = Agent(
    name="stateful_agent",
    model=llm,
    description="An agent that remembers recent searches",
    instruction="""
    You are a stock price assistant. Use the get_stock_price tool.
    I'll remember your previous searches and can tell you about them if you ask.
    """,
    tools=[get_stock_price_stateful],
)

# ✅ Multi-Tool Agent
def get_stock_price_multi(ticker: str, tool_context: ToolContext):
    stock = yf.Ticker(ticker)
    price = stock.info.get("currentPrice", "Price not available")

    if "recent_searches" not in tool_context.state:
        tool_context.state["recent_searches"] = []

    recent_searches = tool_context.state["recent_searches"]
    if ticker not in recent_searches:
        recent_searches.append(ticker)
        tool_context.state["recent_searches"] = recent_searches

    return {"price": price, "ticker": ticker}

def get_stock_info(ticker: str):
    stock = yf.Ticker(ticker)
    company_name = stock.info.get("shortName", "Name not available")
    sector = stock.info.get("sector", "Sector not available")
    return {
        "ticker": ticker,
        "company_name": company_name,
        "sector": sector
    }

multi_tool_agent = Agent(
    name="multi_tool_agent",
    model=llm,
    description="An agent with multiple stock information tools",
    instruction="""
    You are a stock information assistant. You have two tools:
    - get_stock_price: For prices
    - get_stock_info: For company name and sector
    """,
    tools=[get_stock_price_multi, get_stock_info],
)

# ✅ Structured Output Agent
class StockAnalysis(BaseModel):
    ticker: str = Field(description="Stock symbol")
    recommendation: str = Field(description="Buy or Sell recommendation")

def get_stock_data_for_prompt(ticker):
    stock = yf.Ticker(ticker)
    price = stock.info.get("currentPrice", 0)
    target_price = stock.info.get("targetMeanPrice", 0)
    return price, target_price

structured_agent = LlmAgent(
    name="structured_agent",
    model=llm,
    description="An agent with structured output",
    instruction="""
    You are a stock advisor. Analyze the stock ticker provided by the user.
    Return Buy or Sell recommendation in JSON format.

    For each ticker, look at the price and target price to make a decision.
    If target price > current price: recommend Buy
    Otherwise: recommend Sell
    """,
    output_schema=StockAnalysis,
    output_key="stock_analysis"
)

# ✅ Callback Agent
def get_stock_data(ticker: str, tool_context: ToolContext):
    stock = yf.Ticker(ticker)
    price = stock.info.get("currentPrice", 0)

    if "tool_usage" not in tool_context.state:
        tool_context.state["tool_usage"] = {}

    return {
        "ticker": ticker,
        "price": price
    }

def before_tool_callback(tool: BaseTool, args: Dict[str, Any], tool_context: ToolContext) -> Optional[Dict]:
    if "tool_usage" not in tool_context.state:
        tool_context.state["tool_usage"] = {}

    tool_usage = tool_context.state["tool_usage"]
    tool_name = tool.name
    tool_usage[tool_name] = tool_usage.get(tool_name, 0) + 1
    tool_context.state["tool_usage"] = tool_usage

    print(f"[LOG] Running tool: {tool_name}")
    return None

def after_tool_callback(tool: BaseTool, args: Dict[str, Any], tool_context: ToolContext, tool_response: Dict) -> Optional[Dict]:
    print(f"[LOG] Tool {tool.name} completed")
    return None

callback_agent = Agent(
    name="callback_agent",
    model=llm,
    description="An agent with callbacks",
    instruction="""
    You are a stock assistant. Use get_stock_data tool to check stock prices.
    This agent keeps track of how many times tools have been used.
    """,
    tools=[get_stock_data],
    before_tool_callback=before_tool_callback,
    after_tool_callback=after_tool_callback,
)

# ✅ Choose the agent you want as your root
root_agent = multi_tool_agent
