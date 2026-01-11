import React, { useEffect, useState } from 'react';
import { Card, Button, Spin, Empty, Input } from 'antd';
import { useNavigate } from 'react-router-dom';
import { LessonService } from '~/api/services/LessonService';
import type { BotListResponse } from '~/api/services/LessonService';
import { toast } from 'react-toastify';

const { Search } = Input;

export const LessonChooser: React.FC = () => {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<BotListResponse['result']>([]);
  const [filteredLessons, setFilteredLessons] = useState<BotListResponse['result']>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchLessons();
  }, []);

  useEffect(() => {
    if (searchText) {
      const filtered = lessons.filter(lesson =>
        lesson.name.toLowerCase().includes(searchText.toLowerCase()) ||
        lesson.description.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredLessons(filtered);
    } else {
      setFilteredLessons(lessons);
    }
  }, [searchText, lessons]);

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const response = await LessonService.fetchBotList();
      
      if (response.status === 0 && response.result) {
        setLessons(response.result);
        setFilteredLessons(response.result);
      } else {
        toast.error('Failed to load lessons');
      }
    } catch (error: any) {
      console.error('Error fetching lessons:', error);
      toast.error(`Failed to load lessons: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleStartLesson = (lessonId: number) => {
    // Navigate to learner page with the selected lesson
    navigate(`/learn/${lessonId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" tip="Loading lessons..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            🎓 Choose Your Lesson
          </h1>
          <p className="text-gray-600 text-lg">
            Select a lesson to start your AI learning journey
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6 max-w-2xl mx-auto">
          <Search
            placeholder="Search lessons by name or description..."
            allowClear
            size="large"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="shadow-md"
          />
        </div>

        {/* Lesson Grid */}
        {filteredLessons.length === 0 ? (
          <Empty
            description="No lessons found"
            className="mt-20"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLessons.map((lesson) => (
              <Card
                key={lesson.id}
                hoverable
                className="shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-purple-300"
                bodyStyle={{ padding: '24px' }}
              >
                <div className="flex flex-col h-full">
                  {/* Lesson ID Badge */}
                  <div className="mb-3">
                    <span className="inline-block px-3 py-1 text-xs font-semibold text-purple-700 bg-purple-100 rounded-full">
                      ID: {lesson.id}
                    </span>
                  </div>

                  {/* Lesson Name */}
                  <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2">
                    {lesson.name}
                  </h3>

                  {/* Description */}
                  <div className="flex-grow mb-4">
                    {lesson.description ? (
                      <p className="text-gray-600 text-sm line-clamp-3">
                        {lesson.description}
                      </p>
                    ) : (
                      <p className="text-gray-400 text-sm italic">
                        No description available
                      </p>
                    )}
                  </div>

                  {/* Start Button */}
                  <Button
                    type="primary"
                    size="large"
                    block
                    onClick={() => handleStartLesson(lesson.id)}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 border-none hover:from-purple-600 hover:to-pink-600 shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    🚀 Start Learning
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Results Count */}
        {searchText && (
          <div className="text-center mt-6 text-gray-600">
            Found {filteredLessons.length} lesson{filteredLessons.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
};
