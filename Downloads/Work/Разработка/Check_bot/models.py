from sqlalchemy import Column, Integer, String, DateTime, Float, Text, Boolean, ForeignKey, JSON, BigInteger
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
from typing import Optional

Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    telegram_id = Column(Integer, unique=True, index=True, nullable=False)
    username = Column(String(255), index=True)
    first_name = Column(String(255))
    last_name = Column(String(255))
    is_admin = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Yandex OAuth токены
    yandex_access_token = Column(Text, nullable=True)
    yandex_refresh_token = Column(Text, nullable=True)
    yandex_token_expires_at = Column(DateTime, nullable=True)
    yandex_connected_at = Column(DateTime, nullable=True)
    yandex_disk_connected = Column(Boolean, default=False)

    # Связь с чеками
    receipts = relationship("Receipt", back_populates="user")


class Receipt(Base):
    __tablename__ = "receipts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Данные из QR кода
    qr_data = Column(Text, nullable=False)
    
    # Данные из API proverkacheka.com
    receipt_date = Column(DateTime)
    total_sum = Column(Float)
    fiscal_number = Column(String(50))
    fiscal_document = Column(String(50))
    fiscal_sign = Column(String(50))
    inn = Column(String(20))
    organization_name = Column(String(500))
    
    # JSON с полными данными чека
    receipt_json = Column(JSON)
    
    # Файлы
    original_photo_path = Column(String(500))  # Путь к оригинальному фото в S3
    csv_file_path = Column(String(500))        # Путь к CSV файлу в S3
    
    # Статус обработки
    is_processed = Column(Boolean, default=False)
    processing_error = Column(Text)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Связь с пользователем
    user = relationship("User", back_populates="receipts")
    # Связь с позициями
    items = relationship("ReceiptItem", back_populates="receipt")


class ReceiptItem(Base):
    __tablename__ = "receipt_items"

    id = Column(Integer, primary_key=True, index=True)
    receipt_id = Column(Integer, ForeignKey("receipts.id"), nullable=False)
    
    name = Column(String(500), nullable=False)
    price = Column(Float, nullable=False)
    quantity = Column(Float, default=1.0)
    sum_amount = Column(Float, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Связь с чеком
    receipt = relationship("Receipt", back_populates="items") 