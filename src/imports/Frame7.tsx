import img1 from "figma:asset/d684a2c73d70e1183b7fae25e7f6a94388a11020.png";

export default function Frame() {
  return (
    <div className="relative size-full">
      <div className="absolute left-0 size-[1024px] top-0" data-name="이문혈 1">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={img1} />
      </div>
    </div>
  );
}