import img1 from "figma:asset/64e643918948b08319d82a7c62253bf37bacd99b.png";

export default function Frame() {
  return (
    <div className="relative size-full">
      <div className="absolute left-0 size-[1024px] top-0" data-name="사백혈 1">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={img1} />
      </div>
    </div>
  );
}