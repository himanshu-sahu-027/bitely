import {
  Kitchen,
  Menu,
  MenuImage,
  MenuTag,
  MenuTagMap,
} from "../../../models/kitchenCatalog/index.js";

// Load every collection the frontend kitchen page previously joined in memory.
export const loadKitchenPageSourceData = async (kitchenId) => {
  const [kitchenDoc, menuDocs, menuImageDocs, menuTagDocs, menuTagMapDocs] =
    await Promise.all([
      Kitchen.findById(kitchenId).lean(),
      Menu.find({ kitchen_id: kitchenId }).lean(),
      MenuImage.find().lean(),
      MenuTag.find().lean(),
      MenuTagMap.find().lean(),
    ]);

  return {
    kitchenDoc,
    menuDocs,
    menuImageDocs,
    menuTagDocs,
    menuTagMapDocs,
  };
};
