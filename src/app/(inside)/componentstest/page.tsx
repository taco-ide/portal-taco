"use client";

import AlertComponent from "@/components/composed/alert-component";
import ConfirmationButton from "@/components/composed/confirmation-button";
import { LoginForm } from "@/components/login-form";
import { SingUpForm } from "@/components/sing-up-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ComponentsPage() {
    return (
        <div className="m-2 p-2 flex flex-col gap-3">
            <h1>Text</h1>
            {/* Alert */}
            <AlertComponent title="Success" description="This action concluded succesfully" />
            <AlertComponent title="Error" description="Your session has expired. Please log in again." warning={true} />
            {/* Confirmation Button  */}
            <ConfirmationButton
                buttonText="Save"
                title="Are you sure?"
                description="This action cannot be undone."
                confirmButtonText="Save"
                cancelButtonText="Cancel"
                onConfirm={() => {}}
            />
            <ConfirmationButton
                buttonText="Delete"
                title="Are you sure?"
                description="This action cannot be undone."
                confirmButtonText="Delete"
                cancelButtonText="Cancel"
                onConfirm={() => {}}
                warning={true}
            />
            
            {/* Avatar */}
            <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                <AvatarFallback>CN</AvatarFallback>
            </Avatar>
        
            {/* Card with Tabs */}
            <Tabs defaultValue="account" className="w-[400px]">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="account">Account</TabsTrigger>
                    <TabsTrigger value="password">Password</TabsTrigger>
                </TabsList>
                <TabsContent value="account">
                    <Card>
                        <CardHeader>
                            <CardTitle>Account</CardTitle>
                            <CardDescription>
                                Make changes to your account here. Click save when you're done.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="space-y-1">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" defaultValue="Pedro Duarte" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="username">Username</Label>
                                <Input id="username" defaultValue="@peduarte" />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button>Save changes</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
                <TabsContent value="password">
                    <Card>
                        <CardHeader>
                            <CardTitle>Password</CardTitle>
                            <CardDescription>
                                Change your password here. After saving, you'll be logged out.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="space-y-1">
                                <Label htmlFor="current">Current password</Label>
                                <Input id="current" type="password" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="new">New password</Label>
                                <Input id="new" type="password" />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button>Save password</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
            </Tabs>
            <LoginForm />
            <SingUpForm />
        </div>
    );
}