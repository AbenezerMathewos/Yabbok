import React from 'react';
import { Heart, HandHelping, CheckCircle, Clock } from 'lucide-react';

interface AidCardProps {
  post: {
    _id: string;
    type: 'need' | 'offer';
    category: string;
    title: string;
    description: string;
    status: 'open' | 'in_progress' | 'fulfilled';
    user: { name: string; profilePhoto?: string };
    createdAt: string;
  };
  onHelp: (id: string) => void;
  currentUserId?: string;
}

export default function AidCard({ post, onHelp, currentUserId }: AidCardProps) {
  const isNeed = post.type === 'need';
  
  const statusColors = {
    open: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    fulfilled: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  };

  const statusLabels = {
    open: 'Available',
    in_progress: 'In Progress',
    fulfilled: 'Fulfilled',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
      <div className={`h-2 w-full ${isNeed ? 'bg-orange-500' : 'bg-blue-500'}`} />
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isNeed ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'}`}>
            {isNeed ? 'Need' : 'Offer'} &bull; {post.category}
          </span>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[post.status]}`}>
            {statusLabels[post.status]}
          </span>
        </div>

        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{post.title}</h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
          {post.description}
        </p>

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              {post.user.profilePhoto ? (
                <img src={post.user.profilePhoto} alt={post.user.name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-sm font-medium text-gray-500">{post.user.name.charAt(0)}</span>
              )}
            </div>
            <div className="text-sm">
              <p className="text-gray-900 dark:text-white font-medium">{post.user.name}</p>
              <p className="text-gray-500 dark:text-gray-400 text-xs flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {new Date(post.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {post.status === 'open' && (
            <button
              onClick={() => onHelp(post._id)}
              className={`inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${isNeed ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors`}
            >
              {isNeed ? (
                <><HandHelping className="w-4 h-4 mr-1.5" /> I can help</>
              ) : (
                <><Heart className="w-4 h-4 mr-1.5" /> Request this</>
              )}
            </button>
          )}

          {post.status === 'in_progress' && (
            <span className="inline-flex items-center text-sm font-medium text-yellow-600 dark:text-yellow-400">
              <Clock className="w-4 h-4 mr-1.5" /> Being handled
            </span>
          )}

          {post.status === 'fulfilled' && (
            <span className="inline-flex items-center text-sm font-medium text-green-600 dark:text-green-400">
              <CheckCircle className="w-4 h-4 mr-1.5" /> Completed
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
