import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

export const ErrorTestPage = () => {
  const [shouldThrowError, setShouldThrowError] = useState(false);

  if (shouldThrowError) {
    throw new Error('This is a test error for the Error Boundary');
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-6 h-6 text-orange-600" />
            <CardTitle>Error Boundary Test</CardTitle>
          </div>
          <CardDescription>
            This page is used to test the error boundary functionality.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            Click the button below to trigger an error and see how the error boundary handles it.
          </p>
          
          <Button 
            onClick={() => setShouldThrowError(true)}
            variant="destructive"
          >
            Trigger Error
          </Button>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <h3 className="font-medium mb-2">What this tests:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Error boundary catches JavaScript errors</li>
              <li>• Displays a user-friendly error message</li>
              <li>• Provides option to retry/recover</li>
              <li>• Prevents the entire app from crashing</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};