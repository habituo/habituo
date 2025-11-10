import { Text, useToast } from "@chakra-ui/react";
import { deleteArea } from "../hooks/useDatabase";

const useDeleteArea = ({ user, closeModal }) => {
    const toast = useToast();

    const handleDelete = async (selectedArea) => {
        if (!selectedArea) return;

        try {
            await deleteArea(selectedArea.id, user.uid);

            closeModal("delete");

            toast({
                title: <Text fontWeight={600}>Área eliminada</Text>,
                description: "El área ha sido eliminada correctamente.",
                status: "success",
                position: "bottom",
            });
        } catch (error) {
            toast({
                title: <Text fontWeight={600}>Error al eliminar el área</Text>,
                description: error.message,
                status: "error",
                position: "bottom",
            });
        }
    };

    return { handleDelete };
};

export default useDeleteArea;
