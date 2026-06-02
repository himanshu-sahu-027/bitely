import { useMemo, useState } from "react";

import AddressCard from "./AddressCard";
import AddressModal from "./AddressModal";

export default function AddressList({ addresses, onChange }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedAddress, setSelectedAddress] = useState(null);

  const sortedAddresses = useMemo(() => addresses ?? [], [addresses]);

  const openAdd = () => {
    setSelectedAddress(null);
    setModalMode("add");
    setModalOpen(true);
  };

  const openEdit = (addr) => {
    setSelectedAddress(addr);
    setModalMode("edit");
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    await onChange?.({
      type: "delete",
      id,
    });
  };

  const handleSubmit = async (nextAddress) => {
    await onChange?.({
      type: modalMode,
      value: nextAddress,
    });
    setModalOpen(false);
  };

  return (
    <section>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Addresses</h3>
          <p className="text-sm text-slate-500 mt-1">Manage delivery addresses for faster checkout.</p>
        </div>

        <button
          type="button"
          onClick={openAdd}
          className="shrink-0 rounded-xl bg-gradient-to-r from-primary via-secondary to-indigo-600 px-4 py-2 text-white font-semibold shadow-sm transition hover:opacity-90"
        >
          + Add New Address
        </button>
      </div>

      <div className="space-y-4">
        {sortedAddresses.map((addr) => (
          <AddressCard
            key={addr.id}
            address={addr}
            onEdit={openEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {modalOpen && (
        <AddressModal
          open={modalOpen}
          mode={modalMode}
          initialValues={selectedAddress}
          onClose={() => setModalOpen(false)}
          onSubmit={handleSubmit}
        />
      )}
    </section>
  );
}
