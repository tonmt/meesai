import { Search, Home, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NotFoundPage() {
    return (
        <div className="min-h-screen bg-surface-150 flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center">
                {/* 404 Visual */}
                <div className="mb-8">
                    <p className="text-8xl font-extrabold text-primary-900/10 select-none">
                        404
                    </p>
                    <div className="mx-auto w-16 h-16 bg-accent-50 rounded-full flex items-center justify-center -mt-6 relative z-10">
                        <Search className="w-8 h-8 text-accent-500" />
                    </div>
                </div>

                {/* Message */}
                <h1 className="text-2xl font-bold text-primary-900 mb-2">
                    ບໍ່ພົບໜ້ານີ້
                </h1>
                <p className="text-surface-500 text-sm mb-8">
                    ໜ້າທີ່ທ່ານຊອກຫາບໍ່ມີ ຫຼື ຖືກລົບແລ້ວ
                </p>

                {/* Actions */}
                <div className="flex gap-3 justify-center">
                    <Link
                        href="/"
                        className="flex items-center gap-2 px-6 py-3 bg-primary-900 text-white rounded-xl font-semibold text-sm hover:bg-primary-800 transition-colors"
                    >
                        <Home className="w-4 h-4" />
                        ກັບໜ້າຫຼັກ
                    </Link>
                    <Link
                        href="/browse"
                        className="flex items-center gap-2 px-6 py-3 bg-surface-100 text-primary-900 rounded-xl font-semibold text-sm hover:bg-surface-200 transition-colors border border-surface-300"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        ເບິ່ງຊຸດ
                    </Link>
                </div>
            </div>
        </div>
    );
}
