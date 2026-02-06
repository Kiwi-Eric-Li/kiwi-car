import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Eye, Calendar, Edit2, Trash2, CheckCircle, MoreVertical } from 'lucide-react';
import { cn } from '@/utils';
import { formatPrice, formatMileage } from '@/utils/format';
import { useMyListings, type MyListing } from '@/hooks/useMyListings';
import Button from '@/components/common/Button';
import { PageSpinner } from '@/components/common';
import Modal from '@/components/common/Modal';

type TabType = 'active' | 'sold' | 'drafts';

export default function MyListingsPage() {
  const navigate = useNavigate();
  const {
    activeListings,
    soldListings,
    draftListings,
    isLoading,
    error,
    updateStatus,
    deleteListing,
  } = useMyListings();

  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const [deleteModalId, setDeleteModalId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const tabs: { key: TabType; label: string; count: number }[] = [
    { key: 'active', label: 'Active', count: activeListings.length },
    { key: 'sold', label: 'Sold', count: soldListings.length },
    { key: 'drafts', label: 'Drafts', count: draftListings.length },
  ];

  const currentListings =
    activeTab === 'active'
      ? activeListings
      : activeTab === 'sold'
        ? soldListings
        : draftListings;

  const getDaysListed = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleMarkAsSold = async (listingId: string) => {
    await updateStatus(listingId, 'SOLD');
    setActionMenuId(null);
  };

  const handleReactivate = async (listingId: string) => {
    await updateStatus(listingId, 'ACTIVE');
    setActionMenuId(null);
  };

  const handleDelete = async () => {
    if (!deleteModalId) return;
    setIsDeleting(true);
    await deleteListing(deleteModalId);
    setIsDeleting(false);
    setDeleteModalId(null);
  };

  if (isLoading) {
    return <PageSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Listings</h1>
          <Button onClick={() => navigate('/sell')}>
            <Plus className="h-4 w-4 mr-2" />
            Create New Listing
          </Button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex gap-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap',
                  activeTab === tab.key
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                {tab.label}
                <span
                  className={cn(
                    'ml-2 py-0.5 px-2 rounded-full text-xs',
                    activeTab === tab.key
                      ? 'bg-primary-100 text-primary-600'
                      : 'bg-gray-100 text-gray-600'
                  )}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Listings */}
        {currentListings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500 text-lg mb-4">
              {activeTab === 'active'
                ? "You don't have any active listings."
                : activeTab === 'sold'
                  ? "You haven't sold any cars yet."
                  : "You don't have any drafts."}
            </p>
            {activeTab === 'active' && (
              <Button onClick={() => navigate('/sell')}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Listing
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {currentListings.map((listing) => (
              <ListingRow
                key={listing.id}
                listing={listing}
                daysListed={getDaysListed(listing.createdAt)}
                showActions={activeTab !== 'sold'}
                actionMenuOpen={actionMenuId === listing.id}
                onToggleMenu={() =>
                  setActionMenuId(actionMenuId === listing.id ? null : listing.id)
                }
                onCloseMenu={() => setActionMenuId(null)}
                onEdit={() => navigate(`/account/listings/${listing.id}/edit`)}
                onMarkAsSold={() => handleMarkAsSold(listing.id)}
                onReactivate={() => handleReactivate(listing.id)}
                onDelete={() => setDeleteModalId(listing.id)}
                isSold={activeTab === 'sold'}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteModalId}
        onClose={() => setDeleteModalId(null)}
        title="Delete Listing"
      >
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete this listing? This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => setDeleteModalId(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

interface ListingRowProps {
  listing: MyListing;
  daysListed: number;
  showActions: boolean;
  actionMenuOpen: boolean;
  onToggleMenu: () => void;
  onCloseMenu: () => void;
  onEdit: () => void;
  onMarkAsSold: () => void;
  onReactivate: () => void;
  onDelete: () => void;
  isSold: boolean;
}

function ListingRow({
  listing,
  daysListed,
  showActions,
  actionMenuOpen,
  onToggleMenu,
  onCloseMenu,
  onEdit,
  onMarkAsSold,
  onReactivate,
  onDelete,
  isSold,
}: ListingRowProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4">
      {/* Image */}
      <Link to={`/buy/${listing.id}`} className="flex-shrink-0">
        <div className="w-32 h-24 sm:w-40 sm:h-28 rounded-lg overflow-hidden bg-gray-100">
          {listing.coverImage ? (
            <img
              src={listing.coverImage}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}
        </div>
      </Link>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <Link to={`/buy/${listing.id}`}>
          <h3 className="font-semibold text-gray-900 hover:text-primary-600 truncate">
            {listing.title}
          </h3>
        </Link>
        <p className="text-xl font-bold text-primary-600 mt-1">
          {formatPrice(listing.price)}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          {formatMileage(listing.mileage)} • {listing.region}
        </p>

        {/* Stats */}
        <div className="flex gap-4 mt-3 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span>{listing.views} views</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{daysListed} days listed</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 relative">
        {showActions && (
          <>
            <button
              onClick={onToggleMenu}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MoreVertical className="h-5 w-5 text-gray-400" />
            </button>

            {actionMenuOpen && (
              <>
                {/* Overlay to close menu */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={onCloseMenu}
                />
                {/* Menu */}
                <div className="absolute right-0 top-10 z-20 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                  <button
                    onClick={onEdit}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit Listing
                  </button>
                  {!isSold && listing.status === 'ACTIVE' && (
                    <button
                      onClick={onMarkAsSold}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Mark as Sold
                    </button>
                  )}
                  {listing.status === 'DRAFT' && (
                    <button
                      onClick={onMarkAsSold}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Publish
                    </button>
                  )}
                  <button
                    onClick={onDelete}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </>
            )}
          </>
        )}
        {isSold && (
          <button
            onClick={onReactivate}
            className="px-3 py-1.5 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
          >
            Relist
          </button>
        )}
      </div>
    </div>
  );
}
