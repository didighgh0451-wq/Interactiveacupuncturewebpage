import img1 from "figma:asset/9b63330afc669919a429d005330748fa9d6728a6.png";

export default function Frame() {
  return (
    <div className="relative size-full">
      <div className="absolute left-0 size-[1024px] top-0" data-name="천추혈 1">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={img1} />
      </div>
    </div>
  );
}