/*
 * @Author: zlinni zlinni@peropero.net
 * @Date: 2024-12-03 11:44:35
 * @LastEditors: zlinni zlinni@peropero.net
 * @LastEditTime: 2024-12-03 15:13:57
 * @FilePath: \amock\src\app\api\mock\[id]\route.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { NextRequest, NextResponse } from "next/server";
import { mockStorage } from "@/lib/storage";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // 先获取所有端点
    const endpoints = await mockStorage.getAll();
    const endpoint = endpoints.find(e => e.id === id);

    if (!endpoint) {
      return NextResponse.json(
        {
          code: 1,
          data: null,
          msg: "Mock不存在",
        },
        { status: 404 }
      );
    }

    // 返回Mock数据
    return NextResponse.json({
      code: 0,
      data: endpoint.responseBody,
      msg: "success"
    });
  } catch (error) {
    console.error("获取Mock数据失败:", error);
    return NextResponse.json(
      {
        code: 1,
        data: null,
        msg: error instanceof Error ? error.message : "获取Mock数据失败",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const endpoint = await mockStorage.getAll().then(endpoints => 
      endpoints.find(e => e.id === id)
    );

    if (!endpoint) {
      return NextResponse.json({
        code: 1,
        data: null,
        msg: '找不到指定的Mock'
      }, { status: 404 });
    }

    const deleted = await mockStorage.delete(id, endpoint);
    
    if (!deleted) {
      return NextResponse.json({
        code: 1,
        data: null,
        msg: '删除失败'
      }, { status: 500 });
    }

    return NextResponse.json({
      code: 0,
      data: null,
      msg: 'success'
    });
  } catch (error) {
    console.error('删除Mock失败:', error);
    return NextResponse.json({
      code: 1,
      data: null,
      msg: '删除失败'
    }, { status: 500 });
  }
}
