import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { clothingAPI } from '../api/endpoints';

interface Clothing {
  _id: string;
  name: string;
  category: string;
  subcategory: string;
  color: string;
  season: string;
  occasion: string;
  imageUrl: string;
}

export default function Wardrobe() {
  const { user, logout } = useAuth();
  const [clothes, setClothes] = useState<Clothing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchClothes();
  }, []);

  const fetchClothes = async () => {
    setIsLoading(true);
    try {
      const response = await clothingAPI.getAllClothes();
      setClothes(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load clothes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure?')) {
      try {
        await clothingAPI.deleteClothing(id);
        setClothes(clothes.filter((item) => item._id !== id));
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">My Wardrobe</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Welcome, {user?.name}</span>
            <button
              onClick={logout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Add Button */}
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="mb-8 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition font-medium"
        >
          {showAddForm ? 'Cancel' : '+ Add Clothing Item'}
        </button>

        {/* Add Clothing Form */}
        {showAddForm && <AddClothingForm onSuccess={fetchClothes} onCancel={() => setShowAddForm(false)} />}

        {/* Clothes Grid */}
        {isLoading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : clothes.length === 0 ? (
          <div className="text-center text-gray-500">No clothes added yet</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clothes.map((item) => (
              <div key={item._id} className="bg-white rounded-lg shadow hover:shadow-lg transition">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-800">{item.name}</h3>
                  <p className="text-gray-600 text-sm mb-2">{item.subcategory}</p>
                  <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                    <span className="bg-gray-100 px-2 py-1 rounded">{item.color}</span>
                    <span className="bg-gray-100 px-2 py-1 rounded">{item.season}</span>
                    <span className="bg-gray-100 px-2 py-1 rounded">{item.occasion}</span>
                  </div>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

interface AddClothingFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

function AddClothingForm({ onSuccess, onCancel }: AddClothingFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'top',
    subcategory: '',
    color: '',
    season: 'all',
    occasion: 'casual',
  });
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!file) {
      setError('Please select an image');
      return;
    }

    setIsLoading(true);

    try {
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        form.append(key, value);
      });
      form.append('image', file);

      await clothingAPI.addClothing(form);
      setFormData({
        name: '',
        category: 'top',
        subcategory: '',
        color: '',
        season: 'all',
        occasion: 'casual',
      });
      setFile(null);
      onSuccess();
      onCancel();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add clothing');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 mb-8">
      <h2 className="text-xl font-bold mb-4">Add New Clothing Item</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-700 font-medium mb-2">Item Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="top">Top</option>
            <option value="bottom">Bottom</option>
            <option value="footwear">Footwear</option>
            <option value="accessory">Accessory</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">Subcategory</label>
          <input
            type="text"
            name="subcategory"
            value={formData.subcategory}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            placeholder="e.g., shirt, jeans, sneakers"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">Color</label>
          <input
            type="text"
            name="color"
            value={formData.color}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">Season</label>
          <select
            name="season"
            value={formData.season}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Seasons</option>
            <option value="summer">Summer</option>
            <option value="winter">Winter</option>
            <option value="spring">Spring</option>
            <option value="fall">Fall</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">Occasion</label>
          <select
            name="occasion"
            value={formData.occasion}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="casual">Casual</option>
            <option value="formal">Formal</option>
            <option value="party">Party</option>
            <option value="sporty">Sporty</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-gray-700 font-medium mb-2">Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            required
          />
        </div>
      </div>

      <div className="flex gap-4 mt-6">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition font-medium"
        >
          {isLoading ? 'Adding...' : 'Add Item'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-lg hover:bg-gray-400 transition font-medium"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
