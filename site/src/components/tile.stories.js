import React from 'react';
import { Tile, states } from './tile';

export default {
  title: 'Tile',
  component: Tile,
};

export const Default = () => {
  const [minimal] = React.useState(false);
  return (
    <div className="bg-white py-10 md:py-20 w-full h-full">
      <div className="container px-6 mx-auto">
        <div className="flex flex-wrap -mx-6">
          <div className="w-full md:w-1/2 xl:w-1/4 px-4 py-4 xl:py-0">
            <Tile
              name="Title"
              description="Description"
              minimal={minimal}
              value={20}
              status={states.SUCCESS}
              background={<span>.</span>}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
