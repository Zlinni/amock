/*
 * @Author: zlinni zlinni@peropero.net
 * @Date: 2024-12-03 15:24:26
 * @LastEditors: zlinni zlinni@peropero.net
 * @LastEditTime: 2024-12-03 15:34:05
 * @FilePath: \amock\src\app\api\[entity]\route.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { NextRequest, NextResponse } from "next/server";
import { mockStorage } from "@/lib/storage";

export async function GET(
  request: NextRequest,
  { params }: { params: { entity: string } }
) {
  try {
    const { entity } = params;
    const mockEndpoints = await mockStorage.getAll();

    // 查找匹配的端点
    const matchedEndpoint = mockEndpoints.find(
      (endpoint) =>
        endpoint.path === `/api/${entity}` && endpoint.method === "GET"
    );

    if (!matchedEndpoint) {
      return NextResponse.json(
        {
          code: 1,
          data: null,
          msg: "接口不存在",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(matchedEndpoint.responseBody);
  } catch (error) {
    console.error("获取数据失败:", error);
    return NextResponse.json(
      {
        code: 1,
        data: null,
        msg: error instanceof Error ? error.message : "获取数据失败",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { entity: string } }
) {
  try {
    const { entity } = params;
    const mockEndpoints = await mockStorage.getAll();

    // 查找匹配的端点
    const matchedEndpoint = mockEndpoints.find(
      (endpoint) =>
        endpoint.path === `/api/${entity}` && endpoint.method === "POST"
    );

    if (!matchedEndpoint) {
      return NextResponse.json(
        {
          code: 1,
          data: null,
          msg: "接口不存在",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(matchedEndpoint.responseBody);
  } catch (error) {
    console.error("创建数据失败:", error);
    return NextResponse.json(
      {
        code: 1,
        data: null,
        msg: error instanceof Error ? error.message : "创建数据失败",
      },
      { status: 500 }
    );
  }
}
