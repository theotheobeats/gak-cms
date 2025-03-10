"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { type Congregation } from "./columns";

interface CongregationFormDialogProps {
	trigger: React.ReactNode;
	congregation?: Congregation;
	onSuccess: () => void;
}

interface CongregationResponse {
	success: boolean;
	data: Congregation;
}

export function CongregationFormDialog({
	trigger,
	congregation,
	onSuccess,
}: CongregationFormDialogProps) {
	const [open, setOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [isFetching, setIsFetching] = useState(false);
	const [formData, setFormData] = useState({
		name: "",
		whatsappNumber: "",
		address: "",
	});

	const isEditing = !!congregation;

	// Fetch congregation data when editing
	useEffect(() => {
		if (open && isEditing) {
			const fetchCongregation = async () => {
				setIsFetching(true);
				try {
					const response = await fetch(
						`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/congregations/get/${congregation.id}`,
						{
							credentials: "include",
						}
					);
					if (!response.ok) throw new Error("Failed to fetch congregation");
					const result = await response.json() as CongregationResponse;
					if (!result.success) throw new Error("Failed to fetch congregation");
					
					setFormData({
						name: result.data.name,
						whatsappNumber: result.data.whatsappNumber || "",
						address: result.data.address || "",
					});
				} catch (error) {
					console.error("Error fetching congregation:", error);
					toast.error("Gagal memuat data jemaat");
					setOpen(false);
				} finally {
					setIsFetching(false);
				}
			};

			fetchCongregation();
		} else if (!open) {
			// Reset form when dialog closes
			setFormData({
				name: "",
				whatsappNumber: "",
				address: "",
			});
		}
	}, [open, isEditing, congregation?.id]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			const url = isEditing
				? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/congregations/edit/${congregation.id}`
				: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/congregations/create`;

			const response = await fetch(url, {
				method: isEditing ? "PUT" : "POST",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
				body: JSON.stringify(formData),
			});

			if (!response.ok) {
				throw new Error("Failed to save congregation");
			}

			toast.success(
				isEditing
					? "Data jemaat berhasil diperbarui"
					: "Jemaat baru berhasil ditambahkan"
			);
			setOpen(false);
			onSuccess();
		} catch (error) {
			console.error("Error saving congregation:", error);
			toast.error(
				isEditing
					? "Gagal memperbarui data jemaat"
					: "Gagal menambahkan jemaat baru"
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{trigger}</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{isEditing ? "Edit Data Jemaat" : "Tambah Jemaat Baru"}
					</DialogTitle>
				</DialogHeader>
				{isFetching ? (
					<div className="flex items-center justify-center py-8">
						<Loader2 className="h-8 w-8 animate-spin" />
					</div>
				) : (
					<form onSubmit={handleSubmit} className="space-y-4 mt-4">
						<div className="space-y-2">
							<Label htmlFor="name">Nama</Label>
							<Input
								id="name"
								value={formData.name}
								onChange={(e) =>
									setFormData({ ...formData, name: e.target.value })
								}
								placeholder="Masukkan nama jemaat"
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="whatsappNumber">No. WhatsApp</Label>
							<Input
								id="whatsappNumber"
								value={formData.whatsappNumber}
								onChange={(e) =>
									setFormData({
										...formData,
										whatsappNumber: e.target.value,
									})
								}
								placeholder="Contoh: 081234567890"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="address">Alamat</Label>
							<Textarea
								id="address"
								value={formData.address}
								onChange={(e) =>
									setFormData({ ...formData, address: e.target.value })
								}
								placeholder="Masukkan alamat lengkap"
								rows={3}
							/>
						</div>
						<div className="flex justify-end gap-4">
							<Button
								type="button"
								variant="outline"
								onClick={() => setOpen(false)}>
								Batal
							</Button>
							<Button type="submit" disabled={isLoading}>
								{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
								{isEditing ? "Simpan Perubahan" : "Tambah Jemaat"}
							</Button>
						</div>
					</form>
				)}
			</DialogContent>
		</Dialog>
	);
}
