import img2 from "figma:asset/9cb054bf18dd95b518cfb1eb4d7095c6aacec4df.png";

export default function Frame() {
  return (
    <div className="relative size-full">
      <div className="absolute left-0 size-[1024px] top-0" data-name="풍지혈 2">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={img2} />
      </div>
    </div>
  );
}