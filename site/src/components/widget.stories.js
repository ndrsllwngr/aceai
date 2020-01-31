import React from 'react';

export default {
  title: 'Widget',
  component: Widget,
};

export const Widget = () => {
  return (
    <div className="py-10 md:py-20">
      <div className="container px-6 mx-auto">
        <div className="mb-6 md:mb-12">
          <h2 className="text-3xl font-bold text-gray-800 leading-tight">
            Lighthouse Scores
          </h2>
          <p className="text-gray-400">
            All scores which are not affected by performance
          </p>
        </div>
        <div className="flex flex-wrap -mx-6">
          <div className="w-full md:w-1/2 xl:w-1/4 px-4 py-4 xl:py-0">
            <div className="rounded-lg shadow-xl text-center pt-12 pb-6 bg-gradient-gray">
              <div className="leading-none font-number mb-6 text-5xl text-gray-500">
                91
              </div>
              <div className="font-semibold text-gray-700">Accessibility</div>
            </div>
          </div>
          <div className="w-full md:w-1/2 xl:w-1/4 px-4 py-4 xl:py-0">
            <div className="rounded-lg shadow-xl text-center pt-12 pb-6 bg-gradient-green">
              <div className="leading-none font-number mb-6 text-5xl text-green-500">
                100
              </div>
              <div className="font-semibold text-green-700">Best Practices</div>
            </div>
          </div>
          <div className="w-full md:w-1/2 xl:w-1/4 px-4 py-4 xl:py-0">
            <div className="rounded-lg shadow-xl text-center pt-12 pb-6 bg-gradient-red">
              <div className="leading-none font-number mb-6 text-5xl text-red-500">
                94
              </div>
              <div className="font-semibold text-red-700">SEO</div>
            </div>
          </div>
          <div className="w-full md:w-1/2 xl:w-1/4 px-4 py-4 xl:py-0">
            <div className="rounded-lg shadow-xl text-center pt-12 pb-6 bg-gradient-orange">
              <div className="leading-none font-number mb-6 text-5xl text-yellow-500">
                63
              </div>
              <div className="font-semibold text-yellow-700">PWA</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
