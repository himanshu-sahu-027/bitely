import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import CategoryMenu from "../../components/category/CategoryMenu";
import { MenuSection } from "../../components/food";
import { KitchenBanner } from "../../components/kitchen";
import EmptyState from "../../components/layout/EmptyState";
import CustomerReviewDrawer from "../../components/review/CustomerReviewDrawer";
import { getFoodReviews, getKitchenReviews } from "../../services/reviewService";
import { fetchRestaurantDetails } from "../../services/restaurantService";
import FloatingCart from "../cart/cartComponents/FloatingCart";

function KitchenPage() {
  const { id } = useParams();
  const [kitchenPage, setKitchenPage] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("Recommended");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewDrawer, setReviewDrawer] = useState({
    isOpen: false,
    title: "",
    loadReviews: null,
    emptyMessage: "No reviews yet.",
  });

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

  const openKitchenReviews = useCallback(() => {
    setReviewDrawer({
      isOpen: true,
      title: "Kitchen Reviews",
      emptyMessage: "No kitchen reviews yet.",
      loadReviews: async () => {
        const response = await getKitchenReviews(id);
        return response?.data ?? [];
      },
    });
  }, [id]);

  const openFoodReviews = useCallback(({ menuId, name }) => {
    setReviewDrawer({
      isOpen: true,
      title: `${name} Reviews`,
      emptyMessage: `No reviews yet for ${name}.`,
      loadReviews: async () => {
        const response = await getFoodReviews(menuId);
        return response?.data ?? [];
      },
    });
  }, []);

  const closeReviewDrawer = () => {
    setReviewDrawer((current) => ({
      ...current,
      isOpen: false,
    }));
  };

  if (isLoading) {
    return <div className="p-6 text-center">Loading kitchen...</div>;
  }

  if (error || !kitchenPage?.kitchen) {
    if (error) {
      return <div className="p-6 text-center">{error}</div>;
    }

    return (
      <div className="p-6">
        <EmptyState />
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
    kitchen,
  }));

  return (
    <div>
      <KitchenBanner kitchen={kitchen} onOpenReviews={openKitchenReviews} />

      <CategoryMenu
        categories={kitchenPage.categories}
        onSelect={setSelectedCategory}
      />

      {visibleMenuItems.length > 0 ? (
        <MenuSection
          title={selectedCategory}
          foods={visibleMenuItems}
          onOpenFoodReviews={openFoodReviews}
        />
      ) : (
        <div className="px-4 py-6">
          <h3 className="text-lg font-semibold text-slate-900">
            {selectedCategory}
          </h3>
          <div className="mt-4">
            <EmptyState />
          </div>
        </div>
      )}

      <FloatingCart />

      <CustomerReviewDrawer
        isOpen={reviewDrawer.isOpen}
        title={reviewDrawer.title}
        loadReviews={reviewDrawer.loadReviews}
        emptyMessage={reviewDrawer.emptyMessage}
        onClose={closeReviewDrawer}
      />
    </div>
  );
}

export default KitchenPage;
