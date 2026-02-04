export enum PreparationStatusEnum {
    DoesNotRequirePreparation = 0,
    RequiresPreparation = 1,
    InTheKitchen = 2,
    WithTheWaiter = 3,
    ReadyToCollect = 4,
    Completed = 5,
    // Cancelled = 6,
}

export enum PreparationStatusEnumString {
    DoesNotRequirePreparation = 'No requiere preparacion',
    RequiresPreparation = 'Requiere preparacion',
    InTheKitchen = 'En la cocina',
    WithTheWaiter = 'Con el camarero',
    ReadyToCollect = 'Listo para recoger',
    Completed = 'Completado',
    BeingPrepared = 'En preparacion', // Campo adicional para el estado por default de "En preparación"
    // Cancelled = 'Cancelled',
}