/*
 * @Author: zlinni zlinni@peropero.net
 * @Date: 2024-12-03 11:44:26
 * @LastEditors: zlinni zlinni@peropero.net
 * @LastEditTime: 2024-12-04 10:33:32
 * @FilePath: \amock\src\app\api\mock\route.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { NextRequest, NextResponse } from "next/server";
import { mockStorage } from "@/lib/storage";
import { generateMockEndpoints } from "@/lib/openai";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const { description } = await request.json();

    if (!description) {
      return NextResponse.json(
        {
          code: 1,
          data: null,
          msg: "缺少必要参数",
        },
        { status: 400 }
      );
    }

    // 生成 Mock 端点
    const mockEndpoints = await generateMockEndpoints(description);
    console.log("生成的端点数量:", mockEndpoints.length);

    // 串行保存所有端点
    await logger.logTask("保存所有端点", async () => {
      for (const endpoint of mockEndpoints) {
        await mockStorage.set(endpoint.id, endpoint);
      }
    });

    return NextResponse.json({
      code: 0,
      data: mockEndpoints,
      msg: "success",
    });
  } catch (error) {
    console.error("创建Mock失败:", error);
    return NextResponse.json(
      {
        code: 1,
        data: null,
        msg: error instanceof Error ? error.message : "创建Mock失败",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const endpoints = await mockStorage.getAll();
    return NextResponse.json({
      code: 0,
      data: endpoints,
      msg: "success",
    });
  } catch (error) {
    console.error("获取Mock列表失败:", error);
    return NextResponse.json(
      {
        code: 1,
        data: null,
        msg: error instanceof Error ? error.message : "获取Mock列表失败",
      },
      { status: 500 }
    );
  }
}
