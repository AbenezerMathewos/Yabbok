'use client';

import React, { useEffect, useState } from 'react';
import AidCard from '@/frontend/components/community/AidCard';
import { Navbar } from '@/frontend/components/shared/Navbar';
import { Footer } from '@/frontend/components/shared/Footer';
import { HandHeart, PlusCircle } from 'lucide-react';
import { useLanguage } from "@/frontend/context/LanguageContext";

export default function MutualAidPage() {
  const { language } = useLanguage();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'need' | 'offer'>('all');
  
  // Form State
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'need',
    category: 'meals',
    title: '',
    description: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/mutual-aid');
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (error) {
      console.error('Failed to fetch mutual aid posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleHelp = async (postId: string) => {
    if (!confirm(language === 'en' ? 'Are you sure you want to volunteer to help with this? The poster will be notified.' : 'በዚህ ላይ ለመርዳት ፈቃደኛ መሆንዎን እርግጠኛ ነዎት? ለለጠፈው ሰው ማሳወቂያ ይላካል።')) return;
    
    try {
      const res = await fetch('/api/mutual-aid', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, status: 'in_progress' })
      });
      if (res.ok) {
        const updatedPost = await res.json();
        setPosts(posts.map(p => p._id === postId ? updatedPost : p));
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/mutual-aid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        const newPost = await res.json();
        setPosts([newPost, ...posts]);
        setShowForm(false);
        setFormData({ type: 'need', category: 'meals', title: '', description: '' });
      }
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPosts = filter === 'all' ? posts : posts.filter(p => p.type === filter);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate flex items-center">
              <HandHeart className="w-8 h-8 mr-3 text-orange-500" />
              {language === 'en' ? 'Mutual Aid Network' : 'የእርስ በእርስ እርዳታ አውታረ መረብ'}
            </h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {language === 'en' ? 'A place to ask for help when you need it, and offer your skills when you can.' : 'እርዳታ ሲፈልጉ የሚጠይቁበት እና ሲችሉ ችሎታዎን የሚያቀርቡበት ቦታ።'}
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <button
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              {language === 'en' ? 'Create Post' : 'ልጥፍ ፍጠር'}
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="sm:hidden">
            <select
              className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700"
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
            >
              <option value="all">{language === 'en' ? 'All Posts' : 'ሁሉም ልጥፎች'}</option>
              <option value="need">{language === 'en' ? 'Needs' : 'ፍላጎቶች'}</option>
              <option value="offer">{language === 'en' ? 'Offers' : 'ቅናሾች'}</option>
            </select>
          </div>
          <div className="hidden sm:block">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {['all', 'need', 'offer'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab as any)}
                  className={`
                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize
                    ${filter === tab 
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}
                  `}
                >
                  {tab === 'all' 
                    ? (language === 'en' ? 'All Posts' : 'ሁሉም ልጥፎች')
                    : tab === 'need'
                    ? (language === 'en' ? 'Needs' : 'ፍላጎቶች')
                    : (language === 'en' ? 'Offers' : 'ቅናሾች')}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Form Modal / Dropdown */}
        {showForm && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{language === 'en' ? 'Create a New Post' : 'አዲስ ልጥፍ ፍጠር'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{language === 'en' ? 'Type' : 'ዓይነት'}</label>
                  <select 
                    value={formData.type} 
                    onChange={e => setFormData({...formData, type: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="need">{language === 'en' ? 'I have a Need' : 'ፍላጎት አለኝ'}</option>
                    <option value="offer">{language === 'en' ? 'I am Offering Help' : 'እርዳታ እያቀረብኩ ነው'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{language === 'en' ? 'Category' : 'ምድብ'}</label>
                  <select 
                    value={formData.category} 
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="meals">{language === 'en' ? 'Meals / Food' : 'ምግብ'}</option>
                    <option value="transportation">{language === 'en' ? 'Transportation / Rides' : 'መጓጓዣ'}</option>
                    <option value="labor">{language === 'en' ? 'Manual Labor / Repairs' : 'የጉልበት ሥራ / ጥገና'}</option>
                    <option value="prayer">{language === 'en' ? 'Prayer / Counseling' : 'ጸሎት / ምክር'}</option>
                    <option value="financial">{language === 'en' ? 'Financial Assistance' : 'የገንዘብ ድጋፍ'}</option>
                    <option value="other">{language === 'en' ? 'Other' : 'ሌላ'}</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{language === 'en' ? 'Title' : 'ርዕስ'}</label>
                <input 
                  type="text" 
                  required
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder={language === 'en' ? 'E.g., Need a ride to church this Sunday' : 'ለምሳሌ፡ በዚህ እሁድ ወደ ቤተክርስቲያን መጓጓዣ እፈልጋለሁ'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{language === 'en' ? 'Description' : 'መግለጫ'}</label>
                <textarea 
                  required
                  rows={3}
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder={language === 'en' ? 'Describe your need or what you are offering in detail...' : 'ፍላጎትዎን ወይም የሚያቀርቡትን እርዳታ በዝርዝር ይግለጹ...'}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                >
                  {language === 'en' ? 'Cancel' : 'ሰርዝ'}
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                >
                  {submitting ? (language === 'en' ? 'Posting...' : 'በመለጠፍ ላይ...') : (language === 'en' ? 'Post to Community' : 'ለማህበረሰብ ለጥፍ')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Feed */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
            <HandHeart className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">{language === 'en' ? 'No posts yet' : 'ምንም ልጥፎች የሉም'}</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {language === 'en' ? 'Be the first to ask for help or offer your skills.' : 'እርዳታ በመጠየቅ ወይም ችሎታዎን በማቅረብ የመጀመሪያ ይሁኑ።'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map(post => (
              <AidCard key={post._id} post={post} onHelp={handleHelp} />
            ))}
          </div>
        )}

      </div>
    </div>
    <Footer />
    </>
  );
}
