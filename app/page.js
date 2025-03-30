import React from "react";
import Hero from "./_components/Hero";
import Header from "./_components/Header";
import Featues from "./_components/Featues";
import Banners from "./_components/Banners";

const page = () => {
  return (
    <div>
      <Hero />
      <Featues />
      <Banners />
    </div>
  );
};

export default page;
