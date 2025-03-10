"use client"

import { useState } from "react"
import { FileUp, InfoIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useTradingJournal } from "@/hooks/use-trading-journal"

export function CSVImporter() {
  const { importCSV } = useTradingJournal()
  const [file, setFile] = useState<File | null>(null)
  const [csvText, setCsvText] = useState("")
  const [importStatus, setImportStatus] = useState<{ success: boolean; message: string } | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setImportStatus(null)
    }
  }

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCsvText(e.target.value)
    setImportStatus(null)
  }

  const handleFileImport = async () => {
    if (!file) return
    
    try {
      const text = await file.text()
      importCSV(text)
      setImportStatus({ 
        success: true, 
        message: `Successfully imported data from ${file.name}` 
      })
      setFile(null)
    } catch (error) {
      setImportStatus({ 
        success: false, 
        message: `Error importing CSV file: ${error}` 
      })
    }
  }

  const handleTextImport = () => {
    if (!csvText.trim()) return
    
    try {
      importCSV(csvText)
      setImportStatus({ 
        success: true, 
        message: "Successfully imported data from text input" 
      })
      setCsvText("")
    } catch (error) {
      setImportStatus({ 
        success: false, 
        message: `Error importing CSV text: ${error}` 
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Trading Data</CardTitle>
        <CardDescription>
          Upload your trading data from a CSV file or paste it directly
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="file" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="file">File Upload</TabsTrigger>
            <TabsTrigger value="paste">Paste CSV</TabsTrigger>
          </TabsList>
          <TabsContent value="file" className="pt-4 space-y-4">
            <div className="flex flex-col gap-4">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                />
              </div>
              {file && (
                <div>
                  <p className="text-sm text-muted-foreground">Selected file: {file.name}</p>
                  <Button 
                    onClick={handleFileImport} 
                    className="mt-2"
                    size="sm"
                  >
                    <FileUp className="mr-2 h-4 w-4" />
                    Import Data
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="paste" className="pt-4 space-y-4">
            <div className="flex flex-col gap-4">
              <Textarea
                placeholder="Paste your CSV data here..."
                className="min-h-[200px]"
                onChange={handleTextAreaChange}
                value={csvText}
              />
              <Button 
                onClick={handleTextImport} 
                disabled={!csvText.trim()}
                size="sm"
              >
                <FileUp className="mr-2 h-4 w-4" />
                Import Data
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {importStatus && (
          <Alert className="mt-4" variant={importStatus.success ? "default" : "destructive"}>
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>{importStatus.success ? "Success" : "Error"}</AlertTitle>
            <AlertDescription>{importStatus.message}</AlertDescription>
          </Alert>
        )}

        <div className="mt-6 space-y-2">
          <h4 className="text-sm font-medium">Expected CSV Format</h4>
          <p className="text-xs text-muted-foreground">
            Your CSV should have the following columns:
          </p>
          <div className="text-xs text-muted-foreground">
            <ol className="list-decimal list-inside space-y-1">
              <li>Date (MM/DD/YYYY or YYYY-MM-DD)</li>
              <li>Symbol (e.g., ES, NQ, CL)</li>
              <li>Contract (e.g., ESZ23)</li>
              <li>Direction (Long/Short)</li>
              <li>Entry Price</li>
              <li>Exit Price</li>
              <li>Quantity</li>
              <li>PnL (or will be calculated)</li>
              <li>Fees (optional)</li>
              <li>Notes (optional)</li>
            </ol>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            The first row should be headers. Example: <br />
            <code>Date,Symbol,Contract,Direction,EntryPrice,ExitPrice,Quantity,PnL,Fees,Notes</code>
          </p>
        </div>
      </CardContent>
    </Card>
  )
} 