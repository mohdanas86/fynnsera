import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid max-h-screen px-4 w-full">
      <div className="flex flex-col items-center justify-center gap-4 text-center w-full lg:mt-[10%]">
        <div className="w-[30%] ">
          <img src="/notFountSvg.svg" />
        </div>

        <h1 className="mt-6 text-2xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          404 | Not Found
        </h1>

        <p className="mt-4 text-gray-500">We can't find that page.</p>
      </div>
    </div>
  );
}
