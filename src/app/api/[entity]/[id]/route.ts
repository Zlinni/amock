import { NextRequest, NextResponse } from "next/server";
import { mockStorage } from "@/lib/storage";

export async function GET(
  request: NextRequest,
  { params }: { params: { entity: string; id: string } }
) {
  try {
    const { entity, id } = params;
    const mockEndpoints = await mockStorage.getAll();
    
    // 查找匹配的端点
    const matchedEndpoint = mockEndpoints.find(
      endpoint => endpoint.path === `/api/${entity}/:id` && endpoint.method === 'GET'
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { entity: string; id: string } }
) {
  try {
    const { entity, id } = params;
    const mockEndpoints = await mockStorage.getAll();
    
    // 查找匹配的端点
    const matchedEndpoint = mockEndpoints.find(
      endpoint => endpoint.path === `/api/${entity}/:id` && endpoint.method === 'PUT'
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
    console.error("更新数据失败:", error);
    return NextResponse.json(
      {
        code: 1,
        data: null,
        msg: error instanceof Error ? error.message : "更新数据失败",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { entity: string; id: string } }
) {
  try {
    const { entity, id } = params;
    const mockEndpoints = await mockStorage.getAll();
    
    // 查找匹配的端点
    const matchedEndpoint = mockEndpoints.find(
      endpoint => endpoint.path === `/api/${entity}/:id` && endpoint.method === 'DELETE'
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
    console.error("删除数据失败:", error);
    return NextResponse.json(
      {
        code: 1,
        data: null,
        msg: error instanceof Error ? error.message : "删除数据失败",
      },
      { status: 500 }
    );
  }
} 