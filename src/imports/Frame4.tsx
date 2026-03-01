import img1 from "figma:asset/53caf3969bd178da155e6e60fcd56d3f70207c3f.png";

export default function Frame() {
  return (
    <div className="relative size-full">
      <div className="absolute left-0 size-[1024px] top-0" data-name="백회혈 1">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={img1} />
      </div>
    </div>
  );
}