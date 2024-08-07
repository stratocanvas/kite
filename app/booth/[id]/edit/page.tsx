import { GetBooth } from "../fetch";
import BoothForm from "@/app/write/add/page";

function convertId(booth: any) {
  if (!booth) return null;
  return {
    ...booth,
    _id: booth._id.toString()
  };
}

export default async function BoothEditPage({ params }: { params: { id: string } }) {
  const boothData = await GetBooth(params.id);
  const serializedBooth = convertId(boothData);

  return <BoothForm data={serializedBooth} />;
}