import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

function Settings() {
  const navigate = useNavigate();
  const [mouseSensitivity, setMouseSensitivity] = useState(50);
  const [fov, setFov] = useState(90);
  const [graphicsQuality, setGraphicsQuality] = useState('medium');

  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="w-full max-w-2xl p-8">
        <h1 className="text-4xl font-bold text-white mb-8">Settings</h1>

        <div className="space-y-6 bg-gray-800 p-6 rounded-lg">
          {/* Mouse Sensitivity */}
          <div>
            <label className="block text-white text-lg mb-2">
              Mouse Sensitivity: {mouseSensitivity}
            </label>
            <input
              type="range"
              min="1"
              max="100"
              value={mouseSensitivity}
              onChange={(e) => setMouseSensitivity(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* FOV */}
          <div>
            <label className="block text-white text-lg mb-2">Field of View: {fov}°</label>
            <input
              type="range"
              min="60"
              max="120"
              value={fov}
              onChange={(e) => setFov(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Graphics Quality */}
          <div>
            <label className="block text-white text-lg mb-2">Graphics Quality</label>
            <select
              value={graphicsQuality}
              onChange={(e) => setGraphicsQuality(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="ultra">Ultra</option>
            </select>
          </div>

          {/* Invert Y Axis */}
          <div className="flex items-center">
            <input type="checkbox" id="invertY" className="w-5 h-5 mr-3" />
            <label htmlFor="invertY" className="text-white text-lg">
              Invert Y Axis
            </label>
          </div>
        </div>

        <div className="mt-8 flex space-x-4">
          <button
            onClick={() => navigate('/')}
            className="px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white text-lg font-semibold rounded-lg transition-colors"
          >
            Back
          </button>
          <button className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white text-lg font-semibold rounded-lg transition-colors">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings;
