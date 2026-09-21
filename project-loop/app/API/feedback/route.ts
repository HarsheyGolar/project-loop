import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      workspaceId,
      createdById,
      content,
      source,
      metadata,
    } = body;

    if (!workspaceId || !content) {
      return NextResponse.json(
        { error: "workspaceId and content are required" },
        { status: 400 }
      );
    }

    const feedback = await prisma.feedback.create({
      data: {
        workspaceId,
        createdById,
        content,
        source,
        metadata,
      },
    });

    return NextResponse.json(feedback, { status: 201 });
  } catch (error) {
    console.error("Error creating feedback:", error);

    return NextResponse.json(
      { error: "Failed to create feedback" },
      { status: 500 }
    );
  }
}2

export async function GET() {
  try {
    const feedback = await prisma.feedback.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(feedback, { status: 200 });
  } catch (error) {
    console.error("Error fetching feedback:", error);

    return NextResponse.json(
      { error: "Failed to fetch feedback" },
      { status: 500 }
    );
  }
}
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      id,
      content,
      source,
      sentiment,
      summary,
      theme,
      category,
      status,
      metadata,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Feedback id is required" },
        { status: 400 }
      );
    }

    const feedback = await prisma.feedback.update({
      where: {
        id,
      },
      data: {
        content,
        source,
        sentiment,
        summary,
        theme,
        category,
        status,
        metadata,
      },
    });

    return NextResponse.json(feedback, { status: 200 });
  } catch (error) {
    console.error("Error updating feedback:", error);

    return NextResponse.json(
      { error: "Failed to update feedback" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Feedback id is required" },
        { status: 400 }
      );
    }

    await prisma.feedback.delete({
      where: {
        id,
      },
    });

    return NextResponse.json(
      { message: "Feedback deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting feedback:", error);

    return NextResponse.json(
      { error: "Failed to delete feedback" },
      { status: 500 }
    );
  }
}