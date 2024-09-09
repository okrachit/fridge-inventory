import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

const CustomDatePicker = ({ onSelect }) => {
  const [date, setDate] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);

  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handlePrevMonth = () => {
    setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1));
  };

  const handleDateClick = (day) => {
    const selectedDate = new Date(date.getFullYear(), date.getMonth(), day);
    onSelect(selectedDate);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="border p-2 rounded w-full flex items-center justify-between"
      >
        <span>{date.toLocaleDateString()}</span>
        <Calendar size={20} />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border rounded shadow-lg p-4 z-10 w-64">
          <div className="flex justify-between items-center mb-4">
            <button onClick={handlePrevMonth}><ChevronLeft size={24} /></button>
            <span className="text-lg font-bold">{monthNames[date.getMonth()]} {date.getFullYear()}</span>
            <button onClick={handleNextMonth}><ChevronRight size={24} /></button>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} className="text-center font-bold text-sm">{day}</div>
            ))}
            {[...Array(firstDayOfMonth).keys()].map(i => (
              <div key={`empty-${i}`} />
            ))}
            {[...Array(daysInMonth).keys()].map(i => (
              <button
                key={i + 1}
                onClick={() => handleDateClick(i + 1)}
                className="w-8 h-8 flex items-center justify-center hover:bg-blue-100 rounded text-sm"
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const FridgeInventoryApp = () => {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [newExpiryDate, setNewExpiryDate] = useState('');

  useEffect(() => {
    const savedItems = localStorage.getItem('fridgeItems');
    if (savedItems) {
      setItems(JSON.parse(savedItems));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('fridgeItems', JSON.stringify(items));
  }, [items]);

  const parseNaturalLanguageDate = (input) => {
    const today = new Date();
    const lowercaseInput = input.toLowerCase().trim();

    if (lowercaseInput.startsWith('in ')) {
      const [_, amount, unit] = lowercaseInput.split(' ');
      const numAmount = parseInt(amount, 10);

      if (isNaN(numAmount)) return null;

      const newDate = new Date(today);
      switch (unit) {
        case 'day':
        case 'days':
          newDate.setDate(today.getDate() + numAmount);
          break;
        case 'week':
        case 'weeks':
          newDate.setDate(today.getDate() + numAmount * 7);
          break;
        case 'month':
        case 'months':
          newDate.setMonth(today.getMonth() + numAmount);
          break;
        default:
          return null;
      }
      return newDate;
    }

    if (lowercaseInput === 'tomorrow') {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      return tomorrow;
    }

    if (lowercaseInput === 'next week') {
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      return nextWeek;
    }

    // Try parsing as a regular date string
    const parsedDate = new Date(input);
    return isNaN(parsedDate.getTime()) ? null : parsedDate;
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const addItem = () => {
    if (newItem && newExpiryDate) {
      const parsedDate = parseNaturalLanguageDate(newExpiryDate);
      if (parsedDate) {
        const formattedDate = formatDate(parsedDate);
        setItems([...items, { name: newItem, expiryDate: formattedDate }]);
        setNewItem('');
        setNewExpiryDate('');
      } else {
        alert('Invalid date format. Please try again.');
      }
    }
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const getItemStyle = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) {
      return 'bg-red-200';
    } else if (daysUntilExpiry <= 3) {
      return 'bg-yellow-200';
    }
    return 'bg-green-200';
  };

  const handleDateSelect = (selectedDate) => {
    setNewExpiryDate(formatDate(selectedDate));
  };

  return (
    <div className="container mx-auto p-4 max-w-xl">
      <h1 className="text-2xl font-bold mb-4">Fridge Inventory</h1>
      <div className="mb-4">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="Item name"
          className="border p-2 rounded w-full mb-2"
        />
        <div className="flex mb-2 space-x-2">
          <input
            type="text"
            value={newExpiryDate}
            onChange={(e) => setNewExpiryDate(e.target.value)}
            placeholder="Expiry date (e.g., 'in 7 days')"
            className="border p-2 rounded w-1/2"
          />
          <div className="w-1/2">
            <CustomDatePicker onSelect={handleDateSelect} />
          </div>
        </div>
        <button
          onClick={addItem}
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 w-full flex items-center justify-center"
        >
          <PlusCircle size={24} className="mr-2" /> Add Item
        </button>
      </div>
      <ul>
        {items.map((item, index) => (
          <li
            key={index}
            className={`flex justify-between items-center p-2 mb-2 rounded ${getItemStyle(
              item.expiryDate
            )}`}
          >
            <span>{item.name} - Expires: {item.expiryDate}</span>
            <button
              onClick={() => removeItem(index)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 size={20} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FridgeInventoryApp;
