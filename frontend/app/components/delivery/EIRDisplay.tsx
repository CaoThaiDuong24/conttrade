'use client';

import React, { useState } from 'react';
import {
  FileText,
  Download,
  Eye,
  Calendar,
  MapPin,
  User,
  Package,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Printer
} from 'lucide-react';

interface EIRData {
  id: string;
  equipmentNumber: string;
  pickupDate: string;
  pickupLocation: {
    name: string;
    address: string;
    city: string;
    country: string;
  };
  deliveryDate: string;
  deliveryLocation: {
    name: string;
    address: string;
    city: string;
    country: string;
  };
  carrier: {
    name: string;
    driverName: string;
    driverLicense: string;
    truckPlate: string;
  };
  containerDetails: {
    type: string;
    size: string;
    condition: string;
    sealNumber?: string;
  };
  damages?: Array<{
    type: string;
    location: string;
    severity: 'minor' | 'moderate' | 'severe';
    description: string;
    photoUrl?: string;
  }>;
  signatures: {
    shipper?: {
      name: string;
      signature: string;
      timestamp: string;
    };
    driver?: {
      name: string;
      signature: string;
      timestamp: string;
    };
    receiver?: {
      name: string;
      signature: string;
      timestamp: string;
    };
  };
  notes?: string;
  eirNumber: string;
  status: 'draft' | 'signed' | 'completed';
  createdAt: string;
  updatedAt: string;
}

interface EIRDisplayProps {
  eir: EIRData;
  locale: string;
  onDownload?: () => void;
  onPrint?: () => void;
}

export default function EIRDisplay({ eir, locale, onDownload, onPrint }: EIRDisplayProps) {
  const [showDamageDetails, setShowDamageDetails] = useState(false);

  const t = (vi: string, en: string) => (locale === 'vi' ? vi : en);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDamageSeverityColor = (severity: string) => {
    switch (severity) {
      case 'minor':
        return 'text-yellow-600 bg-yellow-100';
      case 'moderate':
        return 'text-orange-600 bg-orange-100';
      case 'severe':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
            <FileText className="w-4 h-4 mr-1" />
            {t('Nháp', 'Draft')}
          </span>
        );
      case 'signed':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
            <CheckCircle className="w-4 h-4 mr-1" />
            {t('Đã ký', 'Signed')}
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
            <CheckCircle className="w-4 h-4 mr-1" />
            {t('Hoàn tất', 'Completed')}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              {t('Biên nhận thiết bị (EIR)', 'Equipment Interchange Receipt (EIR)')}
            </h2>
            <p className="text-blue-100 text-sm">
              {t('Số EIR:', 'EIR Number:')} <span className="font-mono font-semibold">{eir.eirNumber}</span>
            </p>
          </div>
          <div>{getStatusBadge(eir.status)}</div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-4">
          {onDownload && (
            <button
              onClick={onDownload}
              className="flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-md hover:bg-blue-50 transition-colors text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              {t('Tải xuống PDF', 'Download PDF')}
            </button>
          )}
          {onPrint && (
            <button
              onClick={onPrint}
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-400 transition-colors text-sm font-medium"
            >
              <Printer className="w-4 h-4" />
              {t('In', 'Print')}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Equipment Information */}
        <section>
          <h3 className="text-lg font-semibold mb-3 flex items-center text-gray-800">
            <Package className="w-5 h-5 mr-2 text-blue-600" />
            {t('Thông tin thiết bị', 'Equipment Information')}
          </h3>
          <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">{t('Số container', 'Container Number')}</p>
              <p className="font-mono font-semibold text-gray-900">{eir.equipmentNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('Loại', 'Type')}</p>
              <p className="font-semibold text-gray-900">{eir.containerDetails.type}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('Kích thước', 'Size')}</p>
              <p className="font-semibold text-gray-900">{eir.containerDetails.size}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('Tình trạng', 'Condition')}</p>
              <p className="font-semibold text-gray-900">{eir.containerDetails.condition}</p>
            </div>
            {eir.containerDetails.sealNumber && (
              <div className="col-span-2">
                <p className="text-sm text-gray-600">{t('Số seal', 'Seal Number')}</p>
                <p className="font-mono font-semibold text-gray-900">{eir.containerDetails.sealNumber}</p>
              </div>
            )}
          </div>
        </section>

        {/* Pickup Information */}
        <section>
          <h3 className="text-lg font-semibold mb-3 flex items-center text-gray-800">
            <MapPin className="w-5 h-5 mr-2 text-green-600" />
            {t('Thông tin lấy hàng', 'Pickup Information')}
          </h3>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-start gap-3 mb-3">
              <Calendar className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">{t('Ngày lấy hàng', 'Pickup Date')}</p>
                <p className="font-semibold text-gray-900">{formatDate(eir.pickupDate)}</p>
              </div>
            </div>
            <div>
              <p className="font-medium text-gray-900 mb-1">{eir.pickupLocation.name}</p>
              <p className="text-sm text-gray-700">{eir.pickupLocation.address}</p>
              <p className="text-sm text-gray-700">
                {eir.pickupLocation.city}, {eir.pickupLocation.country}
              </p>
            </div>
          </div>
        </section>

        {/* Delivery Information */}
        <section>
          <h3 className="text-lg font-semibold mb-3 flex items-center text-gray-800">
            <MapPin className="w-5 h-5 mr-2 text-blue-600" />
            {t('Thông tin giao hàng', 'Delivery Information')}
          </h3>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-start gap-3 mb-3">
              <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">{t('Ngày giao hàng', 'Delivery Date')}</p>
                <p className="font-semibold text-gray-900">{formatDate(eir.deliveryDate)}</p>
              </div>
            </div>
            <div>
              <p className="font-medium text-gray-900 mb-1">{eir.deliveryLocation.name}</p>
              <p className="text-sm text-gray-700">{eir.deliveryLocation.address}</p>
              <p className="text-sm text-gray-700">
                {eir.deliveryLocation.city}, {eir.deliveryLocation.country}
              </p>
            </div>
          </div>
        </section>

        {/* Carrier Information */}
        <section>
          <h3 className="text-lg font-semibold mb-3 flex items-center text-gray-800">
            <User className="w-5 h-5 mr-2 text-purple-600" />
            {t('Thông tin vận chuyển', 'Carrier Information')}
          </h3>
          <div className="bg-purple-50 rounded-lg p-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">{t('Đơn vị vận chuyển', 'Carrier')}</p>
              <p className="font-semibold text-gray-900">{eir.carrier.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('Tên tài xế', 'Driver Name')}</p>
              <p className="font-semibold text-gray-900">{eir.carrier.driverName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('Số GPLX', 'License Number')}</p>
              <p className="font-mono text-gray-900">{eir.carrier.driverLicense}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('Biển số xe', 'Truck Plate')}</p>
              <p className="font-mono text-gray-900">{eir.carrier.truckPlate}</p>
            </div>
          </div>
        </section>

        {/* Damages */}
        {eir.damages && eir.damages.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold flex items-center text-gray-800">
                <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
                {t('Hư hỏng phát hiện', 'Damages Detected')} ({eir.damages.length})
              </h3>
              <button
                onClick={() => setShowDamageDetails(!showDamageDetails)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                <Eye className="w-4 h-4" />
                {showDamageDetails ? t('Ẩn chi tiết', 'Hide Details') : t('Xem chi tiết', 'View Details')}
              </button>
            </div>

            {showDamageDetails && (
              <div className="space-y-3">
                {eir.damages.map((damage, index) => (
                  <div key={index} className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">{damage.type}</p>
                        <p className="text-sm text-gray-600">{t('Vị trí:', 'Location:')} {damage.location}</p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getDamageSeverityColor(
                          damage.severity
                        )}`}
                      >
                        {damage.severity === 'minor'
                          ? t('Nhỏ', 'Minor')
                          : damage.severity === 'moderate'
                          ? t('Trung bình', 'Moderate')
                          : t('Nghiêm trọng', 'Severe')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{damage.description}</p>
                    {damage.photoUrl && (
                      <img
                        src={damage.photoUrl}
                        alt={`Damage ${index + 1}`}
                        className="w-full max-w-md rounded-lg border border-gray-300"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Signatures */}
        <section>
          <h3 className="text-lg font-semibold mb-3 text-gray-800">{t('Chữ ký xác nhận', 'Signatures')}</h3>
          <div className="grid grid-cols-3 gap-4">
            {/* Shipper Signature */}
            {eir.signatures.shipper && (
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">{t('Người gửi', 'Shipper')}</p>
                <img
                  src={eir.signatures.shipper.signature}
                  alt="Shipper signature"
                  className="w-full h-20 object-contain bg-gray-50 rounded mb-2"
                />
                <p className="text-sm font-medium text-gray-900">{eir.signatures.shipper.name}</p>
                <p className="text-xs text-gray-500">{formatDate(eir.signatures.shipper.timestamp)}</p>
              </div>
            )}

            {/* Driver Signature */}
            {eir.signatures.driver && (
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">{t('Tài xế', 'Driver')}</p>
                <img
                  src={eir.signatures.driver.signature}
                  alt="Driver signature"
                  className="w-full h-20 object-contain bg-gray-50 rounded mb-2"
                />
                <p className="text-sm font-medium text-gray-900">{eir.signatures.driver.name}</p>
                <p className="text-xs text-gray-500">{formatDate(eir.signatures.driver.timestamp)}</p>
              </div>
            )}

            {/* Receiver Signature */}
            {eir.signatures.receiver && (
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">{t('Người nhận', 'Receiver')}</p>
                <img
                  src={eir.signatures.receiver.signature}
                  alt="Receiver signature"
                  className="w-full h-20 object-contain bg-gray-50 rounded mb-2"
                />
                <p className="text-sm font-medium text-gray-900">{eir.signatures.receiver.name}</p>
                <p className="text-xs text-gray-500">{formatDate(eir.signatures.receiver.timestamp)}</p>
              </div>
            )}
          </div>
        </section>

        {/* Notes */}
        {eir.notes && (
          <section>
            <h3 className="text-lg font-semibold mb-3 text-gray-800">{t('Ghi chú', 'Notes')}</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{eir.notes}</p>
            </div>
          </section>
        )}

        {/* Footer */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex justify-between text-xs text-gray-500">
            <p>
              {t('Ngày tạo:', 'Created:')} {formatDate(eir.createdAt)}
            </p>
            <p>
              {t('Cập nhật lần cuối:', 'Last Updated:')} {formatDate(eir.updatedAt)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
