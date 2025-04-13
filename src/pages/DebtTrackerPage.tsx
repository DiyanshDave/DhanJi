import { useState } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const BillSplitterPage = () => {
  const [activeTab, setActiveTab] = useState("split-evenly");
  const [billAmount, setBillAmount] = useState("");
  const [tipPercentage, setTipPercentage] = useState("10");
  const [numberOfPeople, setNumberOfPeople] = useState("2");
  const [results, setResults] = useState<{
    total: number;
    tip: number;
    totalWithTip: number;
    perPerson: number;
  } | null>(null);

  const handleSplitBill = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(billAmount);
    const tip = parseFloat(tipPercentage);
    const people = parseInt(numberOfPeople);

    if (isNaN(amount) {
      alert("Please enter a valid bill amount");
      return;
    }

    if (isNaN(people) || people < 1) {
      alert("Please enter a valid number of people");
      return;
    }

    const tipAmount = amount * (tip / 100);
    const totalWithTip = amount + tipAmount;
    const perPerson = totalWithTip / people;

    setResults({
      total: amount,
      tip: tipAmount,
      totalWithTip,
      perPerson,
    });
  };

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Bill Splitter</h1>
        <p className="text-muted-foreground">
          Easily split bills with friends and calculate tips
        </p>
      </div>

      <Tabs 
        defaultValue="split-evenly" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="split-evenly">Split Evenly</TabsTrigger>
          <TabsTrigger value="custom-split">Custom Split</TabsTrigger>
        </TabsList>

        {/* Split Evenly Tab */}
        <TabsContent value="split-evenly" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Split Bill Evenly</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSplitBill} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="billAmount">Total Bill Amount</Label>
                  <Input
                    id="billAmount"
                    type="number"
                    placeholder="Enter total amount"
                    value={billAmount}
                    onChange={(e) => setBillAmount(e.target.value)}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipPercentage">Tip Percentage</Label>
                  <Input
                    id="tipPercentage"
                    type="number"
                    placeholder="Enter tip percentage"
                    value={tipPercentage}
                    onChange={(e) => setTipPercentage(e.target.value)}
                    min="0"
                    max="100"
                    step="1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numberOfPeople">Number of People</Label>
                  <Input
                    id="numberOfPeople"
                    type="number"
                    placeholder="Enter number of people"
                    value={numberOfPeople}
                    onChange={(e) => setNumberOfPeople(e.target.value)}
                    min="1"
                    required
                  />
                </div>

                <Button type="submit" className="w-full">
                  Calculate Split
                </Button>
              </form>

              {results && (
                <div className="mt-6 space-y-2 p-4 bg-muted rounded-lg">
                  <div className="flex justify-between">
                    <span>Total Bill:</span>
                    <span>₹{results.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tip ({tipPercentage}%):</span>
                    <span>₹{results.tip.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Total with Tip:</span>
                    <span>₹{results.totalWithTip.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-primary mt-2 pt-2 border-t">
                    <span>Each Person Pays:</span>
                    <span>₹{results.perPerson.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Custom Split Tab */}
        <TabsContent value="custom-split" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Custom Bill Split</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Coming soon! This feature will allow you to split bills unevenly among participants.
              </p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setActiveTab("split-evenly")}
              >
                Use Even Split Instead
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
};

export default BillSplitterPage;
