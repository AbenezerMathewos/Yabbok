import { NextResponse } from "next/server";

const MOCK_GALLERY = [
  {
    _id: "1",
    title: "Sunday Worship Service",
    description: "A powerful moment of worship during our main Sunday service.",
    category: "worship",
    imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80",
    createdAt: new Date().toISOString(),
  },
  {
    _id: "2",
    title: "Youth Conference 2023",
    description: "Hundreds of youths gathered for the annual conference.",
    category: "conference",
    imageUrl: "https://images.unsplash.com/photo-1438029071396-1e831a7fa6d8?auto=format&fit=crop&w=800&q=80",
    createdAt: new Date().toISOString(),
  },
  {
    _id: "3",
    title: "Bible Study Group",
    description: "Deep dive into the scriptures during our weekly study.",
    category: "education",
    imageUrl: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80",
    createdAt: new Date().toISOString(),
  },
  {
    _id: "4",
    title: "Community Outreach",
    description: "Serving the local community through our outreach program.",
    category: "outreach",
    imageUrl: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=800&q=80",
    createdAt: new Date().toISOString(),
  },
  {
    _id: "5",
    title: "Praise and Worship Night",
    description: "An evening dedicated purely to praising God.",
    category: "worship",
    imageUrl: "https://images.unsplash.com/photo-1493225457124-a1a2a5f1f92e?auto=format&fit=crop&w=800&q=80",
    createdAt: new Date().toISOString(),
  },
  {
    _id: "6",
    title: "Leadership Seminar",
    description: "Training the next generation of church leaders.",
    category: "education",
    imageUrl: "https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?auto=format&fit=crop&w=800&q=80",
    createdAt: new Date().toISOString(),
  }
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") || "all";

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  let filtered = MOCK_GALLERY;
  if (category !== "all") {
    filtered = MOCK_GALLERY.filter(item => item.category === category);
  }

  return NextResponse.json(filtered, { status: 200 });
}
