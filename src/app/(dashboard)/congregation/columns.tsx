"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Edit, History, Trash2 } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { CongregationFormDialog } from "./congregation-form-dialog";

export type Congregation = {
    id: string;
    name: string;
    whatsappNumber: string | null;
    address: string | null;
    createdAt: string;
    updatedAt: string;
};

export const columns: ColumnDef<Congregation>[] = [
    {
        accessorKey: "name",
        header: "Nama",
    },
    {
        accessorKey: "whatsappNumber",
        header: "No. WhatsApp",
        cell: ({ row }) => {
            const whatsapp = row.getValue("whatsappNumber") as string | null;
            return whatsapp || "-";
        },
    },
    {
        accessorKey: "address",
        header: "Alamat",
        cell: ({ row }) => {
            const address = row.getValue("address") as string | null;
            return address || "-";
        },
    },
    {
        accessorKey: "createdAt",
        header: "Tanggal Bergabung",
        cell: ({ row }) => {
            const date = new Date(row.getValue("createdAt"));
            return format(date, "d MMMM yyyy", { locale: id });
        },
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row, table }) => {
            const congregation = row.original;

            const handleDelete = async () => {
                if (!confirm("Apakah Anda yakin ingin menghapus jemaat ini?")) {
                    return;
                }

                try {
                    const response = await fetch(
                        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/congregations/delete/${congregation.id}`,
                        {
                            method: "DELETE",
                            credentials: "include",
                        }
                    );

                    if (!response.ok) {
                        throw new Error("Failed to delete congregation");
                    }

                    toast.success("Jemaat berhasil dihapus");
                    // @ts-expect-error - meta exists on table instance
                    table.options.meta?.reloadData();
                } catch (error) {
                    console.error("Error deleting congregation:", error);
                    toast.error("Gagal menghapus jemaat");
                }
            };

            return (
                <div className="flex gap-2">
                    <CongregationFormDialog
                        trigger={
                            <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                            </Button>
                        }
                        congregation={congregation}
                        onSuccess={() => {
                            // @ts-expect-error - meta exists on table instance
                            table.options.meta?.reloadData();
                        }}
                    />
                    <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        className="hover:text-primary">
                        <Link href={`/attendance/${congregation.id}`}>
                            <History className="h-4 w-4" />
                        </Link>
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleDelete}
                        className="text-red-600 hover:text-red-800">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            );
        },
    },
]; 