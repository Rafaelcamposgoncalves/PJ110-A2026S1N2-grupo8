<?php

class PedidoStatus {

    private $conn;
    private $table = "pedido_status";

    public function __construct($db) {
        $this->conn = $db;
    }

    /* =========================
       LISTAR POR PEDIDO
    ========================= */
    public function listarPorPedido($idPedido) {

        $sql = "
            SELECT 
                ps.id_pedido_status,
                ps.id_pedido,
                ps.id_status,
                s.descricao,
                s.ordem,
                ps.data,
                ps.observacao
            FROM pedido_status ps
            JOIN status s ON s.id_status = ps.id_status
            WHERE ps.id_pedido = :id
            ORDER BY s.ordem DESC, ps.data DESC
        ";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':id', $idPedido, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /* =========================
       BUSCAR POR ID
    ========================= */
    public function buscar($id) {

        $sql = "
            SELECT 
                ps.id_pedido_status,
                ps.id_pedido,
                ps.id_status,
                s.descricao,
                s.ordem,
                ps.data,
                ps.observacao
            FROM pedido_status ps
            JOIN status s ON s.id_status = ps.id_status
            WHERE ps.id_pedido = :id
            ORDER BY s.ordem DESC, ps.data DESC
        ";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /* =========================
       CRIAR
    ========================= */
    public function criar($idPedido, $idStatus, $data, $observacao = null) {

        $sql = "
            INSERT INTO {$this->table}
            (id_pedido, id_status, data, observacao)
            VALUES (:id_pedido, :id_status, :data, :observacao)
        ";

        $stmt = $this->conn->prepare($sql);

        $stmt->bindParam(':id_pedido', $idPedido, PDO::PARAM_INT);
        $stmt->bindParam(':id_status', $idStatus, PDO::PARAM_INT);
        $stmt->bindParam(':data', $data);
        $stmt->bindParam(':observacao', $observacao);

        return $stmt->execute();
    }

    /* =========================
       ATUALIZAR
    ========================= */
    public function atualizar($id, $idStatus, $data, $observacao = null) {

        $sql = "
            UPDATE {$this->table}
            SET 
                id_status = :id_status,
                data = :data,
                observacao = :observacao
            WHERE id_pedido_status = :id
        ";

        $stmt = $this->conn->prepare($sql);

        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->bindParam(':id_status', $idStatus, PDO::PARAM_INT);
        $stmt->bindParam(':data', $data);
        $stmt->bindParam(':observacao', $observacao);

        return $stmt->execute();
    }

    /* =========================
       DELETAR
    ========================= */
    public function deletar($id) {

        $sql = "
            DELETE FROM {$this->table}
            WHERE id_pedido_status = :id
        ";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);

        return $stmt->execute();
    }
}