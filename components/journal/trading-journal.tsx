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
                Sample CSV Templates
              </CardTitle>
              <CardDescription>
                Download sample CSV templates for your trading data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full" onClick={() => {
                // Create sample CSV content for standard format
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
                Download Standard CSV Template
              </Button>
              
              <Button variant="outline" className="w-full" onClick={() => {
                // Create sample CSV content for Tradovate format
                const sampleTradovateCSV = `orderId,Account,Order ID,B/S,Contract,Product,Product Description,avgPrice,filledQty,Fill Time,lastCommandId,Status,_priceFormat,_priceFormatType,_tickSize,spreadDefinitionId,Version ID,Timestamp,Date,Quantity,Text,Type,Limit Price,Stop Price,decimalLimit,decimalStop,Filled Qty,Avg Fill Price,decimalFillAvg
188886840004,FTDYFG50399595700000009,188886840004, Buy,ESH5,ES,E-Mini S&P 500,4500.25,1,03/09/2025 10:33:21,188886840004, Filled,-2,0,0.25,,188886840004,03/09/2025 10:33:21,3/9/25,1,Chart, Market,,,,,1,4500.25,4500.25
188886840014,FTDYFG50399595700000009,188886840014, Sell,ESH5,ES,E-Mini S&P 500,4510.50,1,03/09/2025 11:36:42,188886840014, Filled,-2,0,0.25,,188886840014,03/09/2025 11:33:57,3/9/25,1,Chart, Market,,,,,,4510.50,4510.50
188886840017,FTDYFG50399595700000009,188886840017, Buy,NQH5,NQ,E-Mini NASDAQ 100,15600.50,1,03/09/2025 13:34:18,188886840017, Filled,-2,0,0.25,,188886840017,03/09/2025 13:34:18,3/9/25,1,Chart, Market,,,,,1,15600.50,15600.50
188886840022,FTDYFG50399595700000009,188886840022, Sell,NQH5,NQ,E-Mini NASDAQ 100,15550.25,1,03/09/2025 14:15:42,188886840022, Filled,-2,0,0.25,,188886840022,03/09/2025 14:15:42,3/9/25,1,Chart, Market,,,,,,15550.25,15550.25
`;
                
                // Create and download the file
                const blob = new Blob([sampleTradovateCSV], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'sample_tradovate_export.csv';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
              }}>
                Download Tradovate CSV Sample
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </TradingJournalProvider>
  )
} 