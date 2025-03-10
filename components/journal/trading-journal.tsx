"use client"

import { CSVImporter } from "@/components/journal/csv-importer"
import { TradingCalendar } from "@/components/journal/trading-calendar"
import { TradingJournalProvider } from "@/hooks/use-trading-journal"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, FileSpreadsheet, Calendar, History, BarChart } from "lucide-react"
import { useState } from "react"

export function TradingJournal() {
  const [activeTab, setActiveTab] = useState("calendar")
  
  return (
    <TradingJournalProvider>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-between items-center mb-4">
              <TabsList>
                <TabsTrigger value="calendar" className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Calendar</span>
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-1">
                  <History className="h-4 w-4" />
                  <span>History</span>
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-1">
                  <BarChart className="h-4 w-4" />
                  <span>Analytics</span>
                </TabsTrigger>
              </TabsList>
              
              <Button size="sm" className="gap-1">
                <PlusCircle className="h-4 w-4" />
                <span>Add Trade</span>
              </Button>
            </div>
            
            <TabsContent value="calendar" className="mt-0">
              <TradingCalendar />
            </TabsContent>
            
            <TabsContent value="history" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Trading History</CardTitle>
                  <CardDescription>Your complete trading history across all days</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Coming soon: detailed trade history display.</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="analytics" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Analytics</CardTitle>
                  <CardDescription>In-depth analysis of your trading performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Coming soon: performance metrics and visualizations.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div>
          <CSVImporter />
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Sample CSV
              </CardTitle>
              <CardDescription>
                Download a sample CSV template for your trading data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" onClick={() => {
                // Create sample CSV content
                const sampleCSV = `Date,Symbol,Contract,Direction,EntryPrice,ExitPrice,Quantity,PnL,Fees,Notes
${new Date().toISOString().split('T')[0]},ES,ESZ23,Long,4500.00,4510.00,1,1000.00,4.50,Morning session trade
${new Date().toISOString().split('T')[0]},NQ,NQZ23,Short,15600.00,15550.00,1,1000.00,4.50,Afternoon reversal
`;
                
                // Create and download the file
                const blob = new Blob([sampleCSV], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'sample_trading_data.csv';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
              }}>
                Download Sample CSV
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </TradingJournalProvider>
  )
} 