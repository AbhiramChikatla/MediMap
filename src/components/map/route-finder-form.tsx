'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface RouteFinderFormProps {
  onFindRoute: (source: string, destination: string, useCurrentLocation: boolean) => void;
  isLoading?: boolean;
}

export function RouteFinderForm({ onFindRoute, isLoading = false }: RouteFinderFormProps) {
  const [source, setSource] = useState<string>('');
  const [destination, setDestination] = useState<string>('');
  const [useCurrentLocation, setUseCurrentLocation] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFindRoute(source, destination, useCurrentLocation);
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-lg">Find Route</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="use-current-location" 
                checked={useCurrentLocation} 
                onCheckedChange={(checked) => {
                  if (checked === true || checked === false) {
                    setUseCurrentLocation(checked);
                  }
                }}
              />
              <Label htmlFor="use-current-location">Use my current location as source</Label>
            </div>
          </div>
          
          {!useCurrentLocation && (
            <div className="space-y-2">
              <Label htmlFor="source">Source Address</Label>
              <Input 
                id="source" 
                placeholder="Enter source address" 
                value={source} 
                onChange={(e) => setSource(e.target.value)} 
                disabled={useCurrentLocation}
                required={!useCurrentLocation}
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="destination">Destination Address</Label>
            <Input 
              id="destination" 
              placeholder="Enter destination address" 
              value={destination} 
              onChange={(e) => setDestination(e.target.value)} 
              required
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Finding Route...' : 'Find Route'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}