import { useState } from "react";
import CategoryMenu from "../../components/category/CategoryMenu";
import { ChatButton, ChatWindow } from "../../components/chat";
import { MenuSection } from "../../components/food";
import { KitchenBanner } from "../../components/kitchen";
import FloatingCart from "../cart/cartComponents/FloatingCart";
import { useParams } from "react-router-dom";
import kitchens from "../../data/kitchens";
import menus from "../../data/menus";
import menuImages from "../../data/menuImages";
// import kitchenFoodCategories from "../../data/kitchenFoodCategories";  // Not used currently, can be used for more complex category handling in kitchen page
// the next two imports are for handling menu tags, which can be used for filtering and displaying tags for menu items handling only recommended, veg and non-veg categories for now
import menuTags from "../../data/menuTags";
import menuTagMap from "../../data/menuTagMap";

function KitchenPage() {
  const [open, setOpen] = useState(false);
  const categories = ["Recommended", "Pure Veg", "Non Veg"];
  const { id } = useParams();
  const kitchen = kitchens.find((currentKitchen) => currentKitchen.id === id);
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [messages, setMessages] = useState([]);

  const sendMessage = (text) => {
    setMessages((currentMessages) => [
      ...currentMessages,
      { sender: "user", text },
    ]);
  };

  if (!kitchen) {
    return (
      <div className="p-6 text-center">
        Kitchen not found
      </div>
    );
  }

  const kitchenMenus = menus
    .filter((menu) => menu.kitchenId === id)
    .map((menu) => {
      const menuImage = menuImages.find((image) => image.menuId === menu.id);
      const tagIds = menuTagMap
        .filter((tagMap) => tagMap.menuId === menu.id)
        .map((tagMap) => tagMap.tagId);
      const tags = menuTags
        .filter((tag) => tagIds.includes(tag.id))
        .map((tag) => tag.name);

      return {
        ...menu,
        image: menuImage?.image ?? menu.image,
        tags,
        kitchen,
      };
    });

  const menuItems = kitchenMenus.filter((menu) => {
    if (selectedCategory === "Recommended") {
      return true;
    }

    if (selectedCategory === "Pure Veg") {
      return menu.tags.includes("veg");
    }

    if (selectedCategory === "Non Veg") {
      return menu.tags.includes("nonveg");
    }

    return true;
  });

  const visibleMenuItems =
    selectedCategory === "Recommended"
      ? [...menuItems]
          .sort((firstMenu, secondMenu) => secondMenu.rating - firstMenu.rating)
          .slice(0, 6)
      : menuItems;

  return (
    <div>
      <KitchenBanner 
        kitchen={kitchen}
      />
       <CategoryMenu
        categories={categories}
        onSelect={setSelectedCategory}
      />
      <MenuSection
        title={selectedCategory}
        foods={visibleMenuItems}
      />

      {open && (
        <ChatWindow
          messages={messages}
          sendMessage={sendMessage}
          closeChat={() => setOpen(false)}
        />
      )}

      <FloatingCart />
      <ChatButton openChat={() => setOpen(true)} />
    </div>
  );
}

export default KitchenPage;
