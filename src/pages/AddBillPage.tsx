
import MainLayout from "@/components/layouts/MainLayout";
import { AddBillForm } from "@/components/bills/AddBillForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const AddBillPage = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Add New Bill</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>New Subscription</CardTitle>
            <CardDescription>
              Add a new recurring subscription or bill to track
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AddBillForm />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default AddBillPage;
