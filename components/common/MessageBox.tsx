import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  X
} from 'lucide-react';

type MessageType = 'error' | 'warning' | 'success' | 'info';

interface MessageBoxProps {
  type: MessageType;
  message: string;
  onClose?: () => void;
}

const styles = {
  error: {
    container: 'bg-red-50 border-red-200 text-red-800',
    icon: <AlertCircle className="w-5 h-5 text-red-500" />,
    label: 'Error'
  },
  warning: {
    container: 'bg-amber-50 border-amber-200 text-amber-800',
    icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
    label: 'Warning'
  },
  success: {
    container: 'bg-green-50 border-green-200 text-green-800',
    icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    label: 'Success'
  },
  info: {
    container: 'bg-blue-50 border-blue-200 text-blue-800',
    icon: <Info className="w-5 h-5 text-blue-500" />,
    label: 'Info'
  }
};

const MessageBox = ({ type, message, onClose }: MessageBoxProps) => {
  const config = styles[type];

  return (
    <div className={`flex items-center p-4 mb-4 border rounded-lg shadow-sm ${config.container}`}>
      <div className="flex-shrink-0">
        {config.icon}
      </div>
      <div className="ml-3 text-sm font-medium flex-grow">
        <span className="font-bold mr-1">{config.label}:</span> {message}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-auto -mx-1.5 -my-1.5 p-1.5 inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-black/5 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default MessageBox;