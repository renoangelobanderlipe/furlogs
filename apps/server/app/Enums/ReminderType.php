<?php

declare(strict_types=1);

namespace App\Enums;

enum ReminderType: string
{
    case Vaccination = 'vaccination';
    case Medication = 'medication';
    case VetAppointment = 'vet_appointment';
    case FoodStock = 'food_stock';
    case Custom = 'custom';
}
