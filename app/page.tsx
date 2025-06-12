"use client";

import { useState, useEffect } from 'react';
import { Plus, Search, CheckCircle, Circle, Edit3, Trash2, Filter, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  // Load todos from localStorage on component mount
  useEffect(() => {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
      try {
        const parsedTodos = JSON.parse(savedTodos).map((todo: any) => ({
          ...todo,
          createdAt: new Date(todo.createdAt),
          updatedAt: new Date(todo.updatedAt),
        }));
        setTodos(parsedTodos);
      } catch (error) {
        console.error('Error parsing saved todos:', error);
      }
    }
  }, []);

  // Save todos to localStorage whenever todos change
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    if (inputValue.trim() !== '') {
      const newTodo: Todo = {
        id: Date.now().toString(),
        text: inputValue.trim(),
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setTodos([newTodo, ...todos]);
      setInputValue('');
    }
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo =>
      todo.id === id
        ? { ...todo, completed: !todo.completed, updatedAt: new Date() }
        : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const startEditing = (id: string, text: string) => {
    setEditingId(id);
    setEditingText(text);
  };

  const saveEdit = () => {
    if (editingText.trim() !== '') {
      setTodos(todos.map(todo =>
        todo.id === editingId
          ? { ...todo, text: editingText.trim(), updatedAt: new Date() }
          : todo
      ));
    }
    setEditingId(null);
    setEditingText('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      action();
    } else if (e.key === 'Escape' && editingId) {
      cancelEdit();
    }
  };

  const clearCompleted = () => {
    setTodos(todos.filter(todo => !todo.completed));
  };

  const filteredTodos = todos.filter(todo => {
    const matchesSearch = todo.text.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'active' && !todo.completed) || 
      (filter === 'completed' && todo.completed);
    return matchesSearch && matchesFilter;
  });

  const completedCount = todos.filter(todo => todo.completed).length;
  const activeCount = todos.length - completedCount;
  const completionPercentage = todos.length > 0 ? (completedCount / todos.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            My Todo List
          </h1>
          <p className="text-gray-600 text-lg">
            Stay organized and get things done
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">{todos.length}</div>
              <div className="text-sm text-gray-600">Total Tasks</div>
            </CardContent>
          </Card>
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-orange-600 mb-1">{activeCount}</div>
              <div className="text-sm text-gray-600">Active Tasks</div>
            </CardContent>
          </Card>
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">{completedCount}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Bar */}
        {todos.length > 0 && (
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Progress</span>
                <span className="text-sm font-medium text-gray-700">{Math.round(completionPercentage)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Add Todo Input */}
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg mb-8">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Input
                  type="text"
                  placeholder="What needs to be done?"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, addTodo)}
                  className="pl-4 pr-4 py-3 text-lg border-2 border-gray-200 focus:border-purple-400 rounded-xl bg-white/80 backdrop-blur-sm transition-all duration-200"
                />
              </div>
              <Button
                onClick={addTodo}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Task
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Search and Filters */}
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search todos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-2 border-2 border-gray-200 focus:border-purple-400 rounded-lg bg-white/80 backdrop-blur-sm transition-all duration-200"
                />
              </div>
              <Tabs value={filter} onValueChange={(value) => setFilter(value as any)} className="w-full md:w-auto">
                <TabsList className="grid w-full md:w-auto grid-cols-3 bg-gray-100/80 backdrop-blur-sm rounded-lg p-1">
                  <TabsTrigger value="all" className="rounded-md">All</TabsTrigger>
                  <TabsTrigger value="active" className="rounded-md">Active</TabsTrigger>
                  <TabsTrigger value="completed" className="rounded-md">Completed</TabsTrigger>
                </TabsList>
              </Tabs>
              {completedCount > 0 && (
                <Button
                  onClick={clearCompleted}
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-lg"
                >
                  Clear Completed
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Todo List */}
        <div className="space-y-3">
          {filteredTodos.length === 0 ? (
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <Calendar className="w-16 h-16 mx-auto mb-4" />
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  {searchQuery ? 'No matching todos found' : 'No todos yet'}
                </h3>
                <p className="text-gray-500">
                  {searchQuery ? 'Try adjusting your search terms' : 'Add your first todo to get started!'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredTodos.map((todo) => (
              <Card
                key={todo.id}
                className={`bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] ${
                  todo.completed ? 'opacity-75' : ''
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Button
                      onClick={() => toggleTodo(todo.id)}
                      variant="ghost"
                      size="sm"
                      className={`rounded-full p-2 transition-all duration-200 ${
                        todo.completed
                          ? 'text-green-600 hover:text-green-700 hover:bg-green-50'
                          : 'text-gray-400 hover:text-green-500 hover:bg-green-50'
                      }`}
                    >
                      {todo.completed ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <Circle className="w-6 h-6" />
                      )}
                    </Button>

                    <div className="flex-1">
                      {editingId === todo.id ? (
                        <Input
                          type="text"
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') saveEdit();
                            if (e.key === 'Escape') cancelEdit();
                          }}
                          onBlur={saveEdit}
                          className="border-2 border-purple-300 focus:border-purple-500 rounded-lg"
                          autoFocus
                        />
                      ) : (
                        <div className="flex flex-col">
                          <span
                            className={`text-lg font-medium cursor-pointer transition-all duration-200 ${
                              todo.completed
                                ? 'text-gray-500 line-through'
                                : 'text-gray-800 hover:text-purple-600'
                            }`}
                            onClick={() => startEditing(todo.id, todo.text)}
                          >
                            {todo.text}
                          </span>
                          <span className="text-xs text-gray-400 mt-1">
                            Created {todo.createdAt.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {todo.completed && (
                        <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                          Completed
                        </Badge>
                      )}
                      <Button
                        onClick={() => startEditing(todo.id, todo.text)}
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all duration-200"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => deleteTodo(todo.id)}
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500">
          <p className="text-sm">
            Made By Sahil Bajaj with ❤️ using Next.js and  React.........
          </p>
        </div>
      </div>
    </div>
  );
}