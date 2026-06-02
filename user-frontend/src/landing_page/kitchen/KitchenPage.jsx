import { useEffect, useState } from "react";
import CategoryMenu from "../../components/category/CategoryMenu";
import { ChatButton, ChatWindow } from "../../components/chat";
import { MenuSection } from "../../components/food";
import { KitchenBanner } from "../../components/kitchen";
import FloatingCart from "../cart/cartComponents/FloatingCart";
import { useParams } from "react-router-dom";
import { fetchRestaurantDetails } from "../../services/restaurantService";

function KitchenPage() {
  const [open, setOpen] = useState(false);
  const { id } = useParams();
  const [kitchenPage, setKitchenPage] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("Recommended");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState([]);

  const sendMessage = (text) => {
    setMessages((currentMessages) => [
      ...currentMessages,
      { sender: "user", text },
    ]);
  };

  useEffect(() => {
    let ignore = false;

    async function loadKitchenPage() {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetchRestaurantDetails(id, {
          selectedCategory,
        });

        if (!ignore) {
          setKitchenPage(response.data);
        }
      } catch (loadError) {
        if (!ignore) {
          setError(loadError.message);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadKitchenPage();

    return () => {
      ignore = true;
    };
  }, [id, selectedCategory]);

  if (isLoading) {
    return <div className="p-6 text-center">Loading kitchen...</div>;
  }

  if (error || !kitchenPage?.kitchen) {
    return (
      <div className="p-6 text-center">
        {error || "Kitchen not found"}
      </div>
    );
  }
  const kitchen = {
    ...kitchenPage.kitchen,
    image: kitchenPage.kitchen.imageUrl,
  };
  const visibleMenuItems = (kitchenPage.visibleMenuItems ?? []).map((menu) => ({
    ...menu,
    image: menu.imageUrl,
  }));

  return (
    <div>
      <KitchenBanner 
        kitchen={kitchen}
      />
       <CategoryMenu
        categories={kitchenPage.categories}
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
