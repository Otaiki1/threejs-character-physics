import { LoadingProgress } from "./threejs/LoadingManager";

interface LoadingUIProps {
  progress: LoadingProgress | null;
  isVisible: boolean;
}

export const LoadingUI = ({ progress, isVisible }: LoadingUIProps) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-bold mb-2">Loading 3D Scene</h2>
          {progress && (
            <>
              <p className="text-gray-600 mb-4">
                Loading {progress.currentItem}... ({progress.percentage}%)
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress.percentage}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500">
                {progress.loaded} of {progress.total} assets loaded
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}; 