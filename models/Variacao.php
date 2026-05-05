<?php

class Variacao {
    private $conn;
    private $table = "variacao";

    public function __construct($db) {
        $this->conn = $db;
    }

    /* ========================= LISTAR ========================= */
/* ========================= LISTAR ========================= */
public function listar($apenasAtivos = false) {
    $sql = " SELECT id_variacao, descricao, ativo FROM {$this->table} ";
    
    // 🔥 Se o parâmetro for true, filtra apenas os ativos (ativo = 1)
    if ($apenasAtivos) {
        $sql .= " WHERE ativo = 1 ";
    }
    
    $sql .= " ORDER BY descricao ASC ";
    
    $stmt = $this->conn->prepare($sql);
    $stmt->execute();
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}




    /* ========================= BUSCAR ========================= */
    public function buscar($id) {
        $sql = " SELECT id_variacao, descricao, ativo FROM {$this->table} WHERE id_variacao = :id ";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /* ========================= CRIAR ========================= */
    public function criar($descricao) {
        // Definimos como 1 (ativo) por padrão ao criar
        $sql = " INSERT INTO {$this->table} (descricao, ativo) VALUES (:descricao, 1) ";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':descricao', $descricao);
        if ($stmt->execute()) {
            return $this->conn->lastInsertId();
        }
        return false;
    }

    /* ========================= ATUALIZAR ========================= */
    public function atualizar($id, $descricao) {
        $sql = " UPDATE {$this->table} SET descricao = :descricao WHERE id_variacao = :id ";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':descricao', $descricao);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        return $stmt->execute();
    }

    /* ========================= ATUALIZAR STATUS ========================= */
    public function atualizarAtivo($id, $ativo) {
        $sql = " UPDATE {$this->table} SET ativo = :ativo WHERE id_variacao = :id ";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':ativo', $ativo, PDO::PARAM_INT);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        return $stmt->execute();
    }

    /* ========================= DELETAR ========================= */
    public function deletar($id) {
        $sql = " DELETE FROM {$this->table} WHERE id_variacao = :id ";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        return $stmt->execute();
    }
}
